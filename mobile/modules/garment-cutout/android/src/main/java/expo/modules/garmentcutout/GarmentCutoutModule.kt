// mobile/modules/garment-cutout/android/.../GarmentCutoutModule.kt
//
// The Android half of the garment cut-out (context/phone-cutout-plan.md):
// cuts the garment out of a photo on the phone with Google ML Kit subject
// segmentation, instead of Cloudinary's paid background removal. The
// iPhone half is ios/GarmentCutoutModule.swift.
//
// cutOutAsync(uri) opens the photo, turns it upright, shrinks it to at most
// INPUT_MAX_SIZE a side, asks ML Kit for the foreground (the subject on a
// transparent background), trims the empty space around it, shrinks it to
// at most OUTPUT_MAX_SIZE and saves it in the app's cache (replacing the
// last one). It returns the saved file and how long each step took.
//
// prepareAsync() asks Google Play services for ML Kit's model ahead of
// time (the app calls it when it opens), so the first cut-out doesn't
// wait for the download.
//
// Release builds must not shrink the app's code
// (android.enableMinifyInReleaseBuilds, set in app.json): shrinking breaks
// ML Kit with a NullPointerException inside its own code.

package expo.modules.garmentcutout

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import android.net.Uri
import android.os.Build
import android.os.SystemClock
import com.google.android.gms.common.api.OptionalModuleApi
import com.google.android.gms.common.moduleinstall.ModuleInstall
import com.google.android.gms.common.moduleinstall.ModuleInstallRequest
import com.google.android.gms.tasks.Task
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine
import kotlin.math.max
import kotlin.math.roundToInt

// The photo is shrunk to this before ML Kit sees it (ML Kit wants at least
// 512 a side; bigger is slower and uses more memory).
private const val INPUT_MAX_SIZE = 1600

// The saved cut-out, at most this many pixels a side - the same as the
// server's background-removed images (server/constants/backgroundRemoval.js).
private const val OUTPUT_MAX_SIZE = 1200

// WebP quality, where the phone supports lossy transparent WebP (Android 11+).
private const val WEBP_QUALITY = 90

// A pixel counts as part of the garment above this alpha (0-255).
private const val ALPHA_THRESHOLD = 8

// How long the first cut-out waits for ML Kit's model to download.
private const val MODEL_WAIT_MS = 90_000L

class GarmentCutoutModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("GarmentCutout")

    AsyncFunction("cutOutAsync") Coroutine { uri: String ->
      return@Coroutine withContext(Dispatchers.Default) {
        try {
          cutOut(uri)
        } catch (error: Throwable) {
          // Show where it went wrong on the test screen, not just what.
          throw RuntimeException(describe(error))
        }
      }
    }

    AsyncFunction("prepareAsync") Coroutine { ->
      return@Coroutine withContext(Dispatchers.Default) {
        val segmenter = SubjectSegmentation.getClient(
          SubjectSegmenterOptions.Builder().enableForegroundBitmap().build()
        )
        try {
          ensureModelDownloaded(segmenter)
          true
        } finally {
          segmenter.close()
        }
      }
    }
  }

  // The error, its causes and the first lines of each one's stack trace.
  private fun describe(error: Throwable): String {
    val lines = mutableListOf<String>()
    var next: Throwable? = error
    while (next != null && lines.size < 40) {
      val current: Throwable = next
      lines += current.toString()
      for (frame in current.stackTrace.take(10)) {
        lines += "  at $frame"
      }
      val cause = current.cause
      next = if (cause === current) null else cause
    }
    return lines.joinToString("\n")
  }

  private suspend fun cutOut(uri: String): Map<String, Any?> {
    val started = SystemClock.elapsedRealtime()

    val photo = loadUpright(Uri.parse(uri))
    val loaded = SystemClock.elapsedRealtime()

    val foreground = segment(photo)
    val segmented = SystemClock.elapsedRealtime()

    val trimmed = trimToContent(foreground)
      ?: throw IllegalStateException("No garment found in this photo")
    val output = shrinkTo(trimmed, OUTPUT_MAX_SIZE)
    val file = save(output)
    val finished = SystemClock.elapsedRealtime()

    return mapOf(
      "uri" to Uri.fromFile(file).toString(),
      "width" to output.width,
      "height" to output.height,
      "bytes" to file.length().toInt(),
      "format" to if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) "webp" else "png",
      "inputWidth" to photo.width,
      "inputHeight" to photo.height,
      "loadMs" to (loaded - started).toInt(),
      "segmentMs" to (segmented - loaded).toInt(),
      "saveMs" to (finished - segmented).toInt(),
      "totalMs" to (finished - started).toInt(),
    )
  }

  // The photo at `uri`, shrunk while decoding and turned the right way up.
  private fun loadUpright(uri: Uri): Bitmap {
    val resolver = context.contentResolver

    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri).use { BitmapFactory.decodeStream(it, null, bounds) }

    if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
      throw IllegalArgumentException("Couldn't read this photo")
    }

    var sampleSize = 1
    while (max(bounds.outWidth, bounds.outHeight) / (sampleSize * 2) >= INPUT_MAX_SIZE) {
      sampleSize *= 2
    }

    val decoded = resolver.openInputStream(uri).use {
      BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sampleSize })
    } ?: throw IllegalArgumentException("Couldn't read this photo")

    val rotation = resolver.openInputStream(uri).use { stream ->
      if (stream == null) 0 else when (
        ExifInterface(stream).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
      ) {
        ExifInterface.ORIENTATION_ROTATE_90 -> 90
        ExifInterface.ORIENTATION_ROTATE_180 -> 180
        ExifInterface.ORIENTATION_ROTATE_270 -> 270
        else -> 0
      }
    }

    val upright = if (rotation == 0) decoded else {
      val matrix = Matrix().apply { postRotate(rotation.toFloat()) }
      Bitmap.createBitmap(decoded, 0, 0, decoded.width, decoded.height, matrix, true)
    }

    return shrinkTo(upright, INPUT_MAX_SIZE)
  }

  // The subject of the photo on a transparent background, from ML Kit.
  private suspend fun segment(photo: Bitmap): Bitmap {
    val options = SubjectSegmenterOptions.Builder()
      .enableForegroundBitmap()
      .build()
    val segmenter = SubjectSegmentation.getClient(options)

    try {
      ensureModelDownloaded(segmenter)

      val result = try {
        segmenter.process(InputImage.fromBitmap(photo, 0)).awaitResult()
      } catch (crash: NullPointerException) {
        // What ML Kit does (instead of a proper error) when its model
        // isn't on the phone yet.
        throw IllegalStateException("ML Kit's model isn't ready on this phone yet. Keep the internet on, wait a minute and try again.")
      }

      return result.foregroundBitmap
        ?: throw IllegalStateException("ML Kit returned nothing for this photo.")
    } finally {
      segmenter.close()
    }
  }

  // ML Kit's model isn't part of the app: Google Play services downloads it
  // to the phone. If it isn't there yet, ask for it and wait until it is.
  private suspend fun ensureModelDownloaded(segmenter: OptionalModuleApi) {
    val installer = ModuleInstall.getClient(context)

    if (installer.areModulesAvailable(segmenter).awaitResult().areModulesAvailable()) {
      return
    }

    installer.installModules(ModuleInstallRequest.newBuilder().addApi(segmenter).build()).awaitResult()

    val giveUpAt = SystemClock.elapsedRealtime() + MODEL_WAIT_MS
    while (SystemClock.elapsedRealtime() < giveUpAt) {
      delay(1000)
      if (installer.areModulesAvailable(segmenter).awaitResult().areModulesAvailable()) {
        return
      }
    }

    throw IllegalStateException("ML Kit's model is still downloading. Keep the internet on and try again in a minute.")
  }

  // Waits for a Google Play services task to finish.
  private suspend fun <T> Task<T>.awaitResult(): T = suspendCoroutine { continuation ->
    addOnSuccessListener { continuation.resume(it) }
    addOnFailureListener { continuation.resumeWithException(it) }
  }

  // `bitmap` cropped to the smallest box holding every visible pixel, or
  // null if nothing is visible.
  private fun trimToContent(bitmap: Bitmap): Bitmap? {
    val width = bitmap.width
    val height = bitmap.height
    val pixels = IntArray(width * height)
    bitmap.getPixels(pixels, 0, width, 0, 0, width, height)

    var left = width
    var top = height
    var right = -1
    var bottom = -1

    for (y in 0 until height) {
      val row = y * width
      for (x in 0 until width) {
        if ((pixels[row + x] ushr 24) > ALPHA_THRESHOLD) {
          if (x < left) left = x
          if (x > right) right = x
          if (y < top) top = y
          if (y > bottom) bottom = y
        }
      }
    }

    if (right < 0) return null

    return Bitmap.createBitmap(bitmap, left, top, right - left + 1, bottom - top + 1)
  }

  // `bitmap` scaled down so neither side is over `maxSize` (never up).
  private fun shrinkTo(bitmap: Bitmap, maxSize: Int): Bitmap {
    val longest = max(bitmap.width, bitmap.height)
    if (longest <= maxSize) return bitmap

    val scale = maxSize.toFloat() / longest
    return Bitmap.createScaledBitmap(
      bitmap,
      (bitmap.width * scale).roundToInt().coerceAtLeast(1),
      (bitmap.height * scale).roundToInt().coerceAtLeast(1),
      true
    )
  }

  // Saves `bitmap` (keeping its transparency) in the app's cache, after
  // deleting the last cut-out (only the newest is ever still needed).
  private fun save(bitmap: Bitmap): File {
    val folder = File(context.cacheDir, "garment-cutout").apply { mkdirs() }
    folder.listFiles()?.forEach { it.delete() }
    val lossyWebp = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
    val file = File(folder, "cutout-${System.currentTimeMillis()}.${if (lossyWebp) "webp" else "png"}")

    FileOutputStream(file).use { out ->
      if (lossyWebp) {
        bitmap.compress(Bitmap.CompressFormat.WEBP_LOSSY, WEBP_QUALITY, out)
      } else {
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
      }
    }

    return file
  }
}
