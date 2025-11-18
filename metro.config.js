// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for serving static files from miniAppsStore
// Note: Metro doesn't serve arbitrary files by default
// For production, use a CDN or server to serve bundle.js and manifest.json
// For development, you may need to set up a local HTTP server or use the asset system

module.exports = config;

