// mobile/modules/garment-cutout/ios/GarmentCutoutModule.swift
//
// The iPhone half of the garment cut-out (context/phone-cutout-plan.md),
// the same as the Android half (android/.../GarmentCutoutModule.kt) but
// with Apple Vision's foreground mask (iOS 17+, part of iOS: the same
// thing as "lift subject from background" in Photos).
//
// UNTESTED: written before the app had an Apple developer account, so it
// has never been built. On an iPhone it can't run on (older than iOS 17),
// or if it fails, the app falls back as on Android.
//
// cutOutAsync(uri) opens the photo, turns it upright and shrinks it to at
// most INPUT_MAX_SIZE a side, asks Vision for the foreground (cropped to
// it, on a transparent background), shrinks it to at most OUTPUT_MAX_SIZE
// and saves it as a PNG in the app's cache (replacing the last one).
// It returns the same fields as Android.

import CoreImage
import ExpoModulesCore
import ImageIO
import UIKit
import Vision

// The photo is shrunk to this before Vision sees it.
private let INPUT_MAX_SIZE = 1600

// The saved cut-out, at most this many pixels a side - the same as
// Android and the server's background-removed images.
private let OUTPUT_MAX_SIZE = 1200

internal final class CutoutUnsupportedException: Exception {
  override var reason: String {
    "Cutting out photos needs iOS 17 or newer"
  }
}

internal final class CutoutFailedException: GenericException<String> {
  override var reason: String {
    param
  }
}

public class GarmentCutoutModule: Module {
  private lazy var ciContext = CIContext()

  public func definition() -> ModuleDefinition {
    Name("GarmentCutout")

    AsyncFunction("cutOutAsync") { (uri: String) throws -> [String: Any] in
      return try self.cutOut(uri: uri)
    }

    // Nothing to download on iPhone: Vision's model is part of iOS.
    AsyncFunction("prepareAsync") { () -> Bool in
      return true
    }
  }

  private func cutOut(uri: String) throws -> [String: Any] {
    guard #available(iOS 17.0, *) else {
      throw CutoutUnsupportedException()
    }

    let started = milliseconds()

    let photo = try loadUpright(uri: uri)
    let loaded = milliseconds()

    let foreground = try segment(photo)
    let segmented = milliseconds()

    let output = shrink(foreground, to: OUTPUT_MAX_SIZE)
    let (file, bytes) = try save(output)
    let finished = milliseconds()

    return [
      "uri": file.absoluteString,
      "width": output.width,
      "height": output.height,
      "bytes": bytes,
      "format": "png",
      "inputWidth": photo.width,
      "inputHeight": photo.height,
      "loadMs": loaded - started,
      "segmentMs": segmented - loaded,
      "saveMs": finished - segmented,
      "totalMs": finished - started,
    ]
  }

  // The photo at `uri`, turned the right way up (its EXIF orientation
  // applied) and shrunk while it's read.
  private func loadUpright(uri: String) throws -> CGImage {
    let url: URL
    if let parsed = URL(string: uri), parsed.scheme != nil {
      url = parsed
    } else {
      url = URL(fileURLWithPath: uri)
    }

    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil) else {
      throw CutoutFailedException("Couldn't read this photo")
    }

    let options: [CFString: Any] = [
      kCGImageSourceCreateThumbnailFromImageAlways: true,
      kCGImageSourceCreateThumbnailWithTransform: true,
      kCGImageSourceThumbnailMaxPixelSize: INPUT_MAX_SIZE,
      kCGImageSourceShouldCacheImmediately: true,
    ]

    guard let image = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary) else {
      throw CutoutFailedException("Couldn't read this photo")
    }

    return image
  }

  // The subject of the photo, cropped to it, on a transparent background.
  @available(iOS 17.0, *)
  private func segment(_ image: CGImage) throws -> CGImage {
    let request = VNGenerateForegroundInstanceMaskRequest()
    let handler = VNImageRequestHandler(cgImage: image, orientation: .up, options: [:])

    try handler.perform([request])

    guard let result = request.results?.first, !result.allInstances.isEmpty else {
      throw CutoutFailedException("No garment found in this photo")
    }

    let buffer = try result.generateMaskedImage(
      ofInstances: result.allInstances,
      from: handler,
      croppedToInstancesExtent: true
    )

    let masked = CIImage(cvPixelBuffer: buffer)

    guard let output = ciContext.createCGImage(masked, from: masked.extent) else {
      throw CutoutFailedException("Couldn't make the cut-out image")
    }

    return output
  }

  // `image` scaled down so neither side is over `maxSize` (never up).
  private func shrink(_ image: CGImage, to maxSize: Int) -> CGImage {
    let longest = max(image.width, image.height)
    if longest <= maxSize {
      return image
    }

    let scale = Double(maxSize) / Double(longest)
    let width = max(1, Int((Double(image.width) * scale).rounded()))
    let height = max(1, Int((Double(image.height) * scale).rounded()))

    guard let context = CGContext(
      data: nil,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: 0,
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
      return image
    }

    context.interpolationQuality = .high
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

    return context.makeImage() ?? image
  }

  // Saves `image` (keeping its transparency) as a PNG in the app's cache,
  // after deleting the last cut-out. Returns the file and its size.
  private func save(_ image: CGImage) throws -> (URL, Int) {
    let caches = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
    let folder = caches.appendingPathComponent("garment-cutout", isDirectory: true)

    try? FileManager.default.removeItem(at: folder)
    try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)

    guard let data = UIImage(cgImage: image).pngData() else {
      throw CutoutFailedException("Couldn't save the cut-out")
    }

    let file = folder.appendingPathComponent("cutout-\(milliseconds()).png")
    try data.write(to: file)

    return (file, data.count)
  }

  private func milliseconds() -> Int {
    Int(DispatchTime.now().uptimeNanoseconds / 1_000_000)
  }
}
