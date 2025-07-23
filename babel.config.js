module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],  // for Jest/node environment
    '@babel/preset-react',   // JSX support
    '@babel/preset-typescript' // TS/TSX support
  ],
};