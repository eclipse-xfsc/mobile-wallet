module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['import', { libraryName: '@ant-design/react-native' }],
    ['@babel/plugin-proposal-export-namespace-from', {}],
    [
      'react-native-reanimated/plugin',
      {
        globals: ['__scanCodes'],
      },
    ],
    [
      'module-resolver',
      {
        alias: {
          crypto: 'react-native-quick-crypto',
          stream: 'stream-browserify',
          buffer: '@craftzdog/react-native-buffer',
        },
      },
    ],
  ],
};
