const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...(config.resolver.sourceExts ?? []), 'ts', 'tsx', 'mjs'];

// Monorepo: watch the repo root so shared packages resolve.
const workspaceRoot = path.resolve(__dirname, '../..');
config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot];

// CRITICAL: force a SINGLE copy of React / React DOM / React Native.
// The repo root carries React 19 (for the web app); the mobile app needs 18.3.1.
// Without pinning, Metro can bundle both → duplicate React → null hooks dispatcher
// ("Cannot read properties of null (reading 'useState')"). Pin to the app's copy.
const pinned = {
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
};
config.resolver.extraNodeModules = { ...(config.resolver.extraNodeModules ?? {}), ...pinned };

const origResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react' || moduleName === 'react-dom' || moduleName === 'react-native'
      || moduleName.startsWith('react/') || moduleName.startsWith('react-dom/')) {
    const base = moduleName.split('/')[0];
    const sub = moduleName.slice(base.length); // '' or '/jsx-runtime' etc.
    return {
      type: 'sourceFile',
      filePath: require.resolve(pinned[base] + sub, { paths: [__dirname] }),
    };
  }
  return origResolveRequest
    ? origResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
