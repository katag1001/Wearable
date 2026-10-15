// mobile/metro.config.js
//
// Lets the app import the shared client code in ../core and the shared
// JSON in ../shared (see context/mobile-app-plan.md).
//
// The repo isn't an npm workspace: the web app's node_modules at the root
// has its own React, on a different version from this app's. If code in
// core/ imported "react" the normal way, Metro would walk up from core/,
// find the root copy, and the app would run two Reacts ("Invalid hook
// call"). So every package import made from outside mobile/ is resolved
// as if it were made from mobile/ - core/ always gets this app's React,
// axios, etc.

const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");
const coreRoot = path.join(repoRoot, "core");
const sharedRoot = path.join(repoRoot, "shared");

const config = getDefaultConfig(projectRoot);

// Watch core/ and shared/ so edits there reload the app.
config.watchFolders = [...(config.watchFolders ?? []), coreRoot, sharedRoot];

const isInside = (dir, file) => {
  const relative = path.relative(dir, file);

  return !relative.startsWith("..") && !path.isAbsolute(relative);
};

const isPackageImport = (moduleName) =>
  !moduleName.startsWith(".") && !path.isAbsolute(moduleName);

// Where package imports from outside mobile/ are resolved from.
const resolveFromHere = path.join(projectRoot, "package.json");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // "@core/x" -> <repo>/core/x
  if (moduleName === "@core" || moduleName.startsWith("@core/")) {
    return context.resolveRequest(
      context,
      path.join(coreRoot, moduleName.slice("@core".length)),
      platform
    );
  }

  if (
    isPackageImport(moduleName) &&
    !isInside(projectRoot, context.originModulePath)
  ) {
    return context.resolveRequest(
      { ...context, originModulePath: resolveFromHere },
      moduleName,
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
