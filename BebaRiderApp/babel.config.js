module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        reanimated: true,
        worklets: true,
      }],
    ],
    plugins: [
      // Optional: If you want to use the new JSX transform
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    ],
  };
};
