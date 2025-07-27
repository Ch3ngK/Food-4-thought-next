// Simple mock that handles most Emotion use cases
const React = require('react');

module.exports = {
  css: () => ({}),
  cx: (...args) => args.join(' '),
  // Mock the JSX runtime
  jsx: React.createElement,
  jsxs: React.createElement,
  // Add any other Emotion exports you use
  ThemeContext: React.createContext({})
};