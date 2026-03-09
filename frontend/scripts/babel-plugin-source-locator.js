module.exports = function ({ types: t }) {
  return {
    visitor: {
      JSXOpeningElement(path, state) {
        const nameNode = path.node.name;
        // Only inject to HTML tags (lowercase) to avoid blowing up React warnings on unknown props for custom components
        if (t.isJSXIdentifier(nameNode) && /^[a-z]/.test(nameNode.name)) {
          const loc = path.node.loc;
          if (loc && state.file.opts.filename && !state.file.opts.filename.includes('node_modules')) {
            const ext = state.file.opts.filename.split('.').pop();
            // Only handle typical extensions to avoid edge cases
            if (['tsx', 'ts', 'jsx', 'js'].includes(ext)) {
               path.node.attributes.push(
                 t.jsxAttribute(
                   t.jsxIdentifier("data-source-loc"),
                   t.stringLiteral(`${state.file.opts.filename}::${loc.start.line}::${loc.start.column + 1}`)
                 )
               );
            }
          }
        }
      }
    }
  };
};
