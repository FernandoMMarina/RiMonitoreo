module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: [
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }],
      'expo-asset/babel', // Asegúrate de incluir este plugin
    ],
  };
};
