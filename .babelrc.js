module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        bugfixes: true,
        modules: false
      }
    ],
    [
      // Babel applies presets in reverse, so listing this last makes it run
      // first — the type stripping has to happen before preset-env touches the
      // class fields.
      '@babel/preset-typescript',
      {
        // `declare` fields carry types for constructor-assigned properties
        // without emitting a runtime field definition
        allowDeclareFields: true
      }
    ]
  ]
};
