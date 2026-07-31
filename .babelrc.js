module.exports = {
  presets: [
    // Strips the type annotations; `erasableSyntaxOnly` in tsconfig.json keeps
    // the sources to syntax that stripping alone can handle.
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        loose: true,
        bugfixes: true,
        modules: false
      }
    ]
  ]
};
