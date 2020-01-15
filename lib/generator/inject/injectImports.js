const fs = require('fs');
const path = require('path');
const recast = require('recast');

module.exports = function injectAndOptions(file, options) {
  let extname = path.extname(file);

  let source = fs.readFileSync(path.resolve(options.cwd, file), 'utf-8');

  if (extname == '.js') {
    let imports = options.js;
    imports = imports instanceof Set ? Array.from(imports) : imports;
    let hasImports = imports && imports.length > 0;
    if (!hasImports) return source;

    return handleJS(source, imports);
  } else {
    return source;
  }
};

function handleJS(source, imports) {
  const ast = recast.parse(source);

  const toImport = i => recast.parse(`${i}\n`).program.body[0];
  const importDeclarations = [];
  let lastImportIndex = -1;

  recast.types.visit(ast, {
    visitImportDeclaration({ node }) {
      lastImportIndex = ast.program.body.findIndex(n => n === node);
      importDeclarations.push(node);
      return false;
    }
  });

  // avoid blank line after the previous import
  ast.program.body[lastImportIndex] && delete ast.program.body[lastImportIndex].loc;

  const nonDuplicates = i => {
    return !importDeclarations.some(node => {
      const result =
        node.source.raw === i.source.raw && node.specifiers.length === i.specifiers.length;

      return (
        result &&
        node.specifiers.every((item, index) => {
          return i.specifiers[index].local.name === item.local.name;
        })
      );
    });
  };

  const newImports = imports.map(toImport).filter(nonDuplicates);
  ast.program.body.splice(lastImportIndex + 1, 0, ...newImports);

  return recast.print(ast).code;
}
