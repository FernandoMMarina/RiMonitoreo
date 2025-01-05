const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    // Elimina cualquier configuración de babel relacionada con expo-asset
    babelTransformerPath: require.resolve('react-native-svg-transformer'), // Si usas SVGs
  },
  resolver: {
    ...defaultConfig.resolver,
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg'), // Excluye SVG si usas react-native-svg-transformer
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'], // Añade SVG como fuente si lo necesitas
  },
};
