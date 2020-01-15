const recast = require('recast');
const parse5 = require('parse5');
const fs = require('fs');
const path = require('path');

function checkJSFile(file, options = {}) {
  let imports = options.js;

  imports = imports instanceof Set ? Array.from(imports) : imports;

  let hasImports = imports && imports.length > 0;

  if (!hasImports) return false;

  let extname = path.extname(file);

  if (extname != '.js') return false;

  return imports;
}

function injectImports(ast, injectAst) {
  let importDeclarations = [];
  let lastImportIndex = -1;

  recast.types.visit(injectAst, {
    visitImportDeclaration({ node }) {
      importDeclarations.push(node);
      return false;
    }
  });

  recast.types.visit(ast, {
    visitImportDeclaration({ node }) {
      lastImportIndex = ast.program.body.findIndex(n => n === node);
      importDeclarations = importDeclarations.filter(i => i.source.value != node.source.value);
      return false;
    }
  });

  ast.program.body[lastImportIndex] && delete ast.program.body[lastImportIndex].loc;

  ast.program.body.splice(lastImportIndex + 1, 0, ...importDeclarations);

  return lastImportIndex;
}

function handleVueJs(source, imports) {
  let ast = recast.parse(source, {
    parser: require('recast/parsers/babylon')
  });

  let injectAst = recast.parse(imports[0], {
    parser: require('recast/parsers/babylon')
  });

  let properties = [];
  let injectProperties = [];

  recast.types.visit(injectAst, {
    visitExportDefaultDeclaration({ node }) {
      injectProperties = node.declaration.properties;
      return false;
    }
  });

  recast.types.visit(ast, {
    visitExportDefaultDeclaration({ node }) {
      properties = node.declaration.properties;
      return false;
    }
  });

  injectImports(ast, injectAst);

  injectProperties.forEach(inject => {
    let index = properties.findIndex(p => p.key.name == inject.key.name);
    if (index < 0) {
      properties.splice(properties.length, 0, inject);
    } else {
      if (inject.type == 'ObjectProperty') {
        inject.value.properties.forEach(m => {
          properties.forEach(old => {
            if (inject.key.name == old.key.name && old.type == 'ObjectProperty') {
              if (m.type == 'ObjectMethod') {
                let innerIndex = old.value.properties.findIndex(p => p.key.name == m.key.name);
                if (innerIndex < 0) {
                  old.value.properties.splice(old.value.properties.length, 0, m);
                }
              } else if (
                m.type == 'SpreadProperty' &&
                (m.argument.callee.name == 'mapState' || m.argument.callee.name == 'mapGetters')
              ) {
                if (m.argument.arguments[0].type == 'StringLiteral') {
                  let innerIndex = old.value.properties.findIndex(
                    p => p.argument.arguments[0].name == m.argument.arguments[0].name
                  );

                  if (innerIndex < 0) {
                    old.value.properties.splice(old.value.properties.length, 0, m);
                  } else {
                    let oldMp = old.value.properties[innerIndex].argument.arguments[1].properties;
                    m.argument.arguments[1].properties.forEach(mp => {
                      let innnerIndex = oldMp.findIndex(p => p.key.name == mp.key.name);
                      if (innnerIndex < 0) {
                        oldMp.splice(oldMp.length, 0, mp);
                      }
                    });
                  }
                } else if (m.argument.arguments[0].type == 'ObjectExpression') {
                  let oldMp = old.value.properties[innerIndex].argument.arguments[0].properties;
                  m.argument.arguments[0].properties.forEach(mp => {
                    let innnerIndex = oldMp.findIndex(p => p.key.name == mp.key.name);
                    if (innnerIndex < 0) {
                      oldMp.splice(oldMp.length, 0, mp);
                    }
                  });
                }
              } else if (m.type == 'ObjectProperty') {
                let innerIndex = old.value.properties.findIndex(p => p.key.name == m.key.name);
                if (innerIndex < 0) {
                  old.value.properties.splice(old.value.properties.length, 0, m);
                }
              }
            }
          });
        });
      }
    }
  });

  return recast.print(ast).code;
}

function handleVueModule(source, imports) {
  let ast = recast.parse(source, {
    parser: require('recast/parsers/babylon')
  });

  let injectAst = recast.parse(imports[0], {
    parser: require('recast/parsers/babylon')
  });

  let injectState, injectActions, injectMutations, injectGetters;
  let oldState, oldActions, oldMutations, oldGetters;

  recast.types.visit(injectAst, {
    visitVariableDeclaration({ node }) {
      if (node.declarations[0].type == 'VariableDeclarator') {
        switch (node.declarations[0].id.name) {
          case 'state':
            injectState = node;
            break;
          case 'actions':
            injectActions = node;
            break;
          case 'mutations':
            injectMutations = node;
            break;
          case 'getters':
            injectGetters = node;
            break;
        }
      }
      return false;
    }
  });

  recast.types.visit(ast, {
    visitVariableDeclaration({ node }) {
      if (node.declarations[0].type == 'VariableDeclarator') {
        switch (node.declarations[0].id.name) {
          case 'state':
            oldState = node.declarations[0].init;
            break;
          case 'actions':
            oldActions = node.declarations[0].init;
            break;
          case 'mutations':
            oldMutations = node.declarations[0].init;
            break;
          case 'getters':
            oldGetters = node.declarations[0].init;
            break;
        }
      }
      return false;
    }
  });

  let lastImportIndex = injectImports(ast, injectAst);

  lastImportIndex++;

  function handleState(node) {
    if (!node) {
      if (injectActions) {
        ast.program.body.splice(lastImportIndex + 1, 0, injectState);
      }
      return;
    }

    if (!injectState) return false;

    let injectNode;
    let mergeState = properties => {
      injectNode.forEach(pro => {
        if (pro.type == 'ObjectProperty') {
          let index = properties.findIndex(old => old.key.name == pro.key.name);
          if (index < 0) {
            properties.splice(properties.length, 0, pro);
          }
        }
      });
    };

    if (injectState.declarations[0].init.type == 'ArrowFunctionExpression') {
      injectState.declarations[0].init.body.body.forEach(ret => {
        if (ret.type == 'ReturnStatement' && ret.argument.type == 'ObjectExpression') {
          injectNode = ret.argument.properties;
          return;
        }
      });
    } else if (injectState.declarations[0].init.type == 'ObjectExpression') {
      injectNode = injectState.declarations[0].init.properties;
    }

    if (!injectNode) return;

    if (node.type == 'ArrowFunctionExpression') {
      node.body.body.forEach(ret => {
        if (ret.type == 'ReturnStatement' && ret.argument.type == 'ObjectExpression') {
          mergeState(ret.argument.properties);
          return;
        }
      });
    } else if (node.type == 'ObjectExpression') {
      mergeState(node.properties);
    }
  }

  function handleActions(node) {
    if (!node) {
      if (injectActions) {
        ast.program.body.splice(lastImportIndex + 1, 0, injectActions);
      }
      return;
    }
    if (node.type != 'ObjectExpression' || !injectActions) return;

    injectActions.declarations[0].init.properties.forEach(pro => {
      if (pro.type == 'ObjectMethod') {
        let index = node.properties.findIndex(old => old.key.name == pro.key.name);
        if (index < 0) {
          node.properties.splice(node.properties.length, 0, pro);
        }
      }
    });
  }

  function handleMutations(node) {
    if (!node) {
      if (injectMutations) {
        ast.program.body.splice(lastImportIndex + 1, 0, injectMutations);
      }
      return;
    }

    if (node.type != 'ObjectExpression' || !injectMutations) return;

    injectMutations.declarations[0].init.properties.forEach(pro => {
      if (pro.type == 'ObjectMethod') {
        let index = node.properties.findIndex(old => old.key.name == pro.key.name);
        if (index < 0) {
          node.properties.splice(node.properties.length, 0, pro);
        }
      }
    });
  }

  function handleGetters(node) {
    if (!node) {
      if (injectGetters) {
        ast.program.body.splice(lastImportIndex + 1, 0, injectGetters);
      }
      return;
    }
    if (node.type != 'ObjectExpression' || !injectGetters) return;

    injectGetters.declarations[0].init.properties.forEach(pro => {
      if (pro.type == 'ObjectMethod') {
        let index = node.properties.findIndex(old => old.key.name == pro.key.name);
        if (index < 0) {
          node.properties.splice(node.properties.length, 0, pro);
        }
      }
    });
  }

  handleMutations(oldMutations);
  handleActions(oldActions);
  handleGetters(oldGetters);
  handleState(oldState);

  return recast.print(ast).code;
}

function handleVueRoutes(source, imports) {
  let ast = recast.parse(source, {
    parser: require('recast/parsers/babylon')
  });

  let injectAst = recast.parse(imports[0], {
    parser: require('recast/parsers/babylon')
  });

  let oldRoutes, injectRoutes;

  recast.types.visit(injectAst, {
    visitVariableDeclaration({ node }) {
      if (
        node.declarations[0].type == 'VariableDeclarator' &&
        node.declarations[0].id.name == 'routes' &&
        node.declarations[0].init.type == 'ArrayExpression'
      ) {
        injectRoutes = node.declarations[0].init.elements;
      }
      return false;
    }
  });

  recast.types.visit(ast, {
    visitVariableDeclaration({ node }) {
      if (
        node.declarations[0].type == 'VariableDeclarator' &&
        node.declarations[0].id.name == 'routes' &&
        node.declarations[0].init.type == 'ArrayExpression'
      ) {
        oldRoutes = node.declarations[0].init.elements;
      }
      return false;
    }
  });

  function mergeRoutes() {
    if (!oldRoutes || !injectRoutes) return;

    injectRoutes.forEach(node => {
      if (node.type == 'ObjectExpression') {
        let index = node.properties.findIndex(obj => obj.key.name == 'path');
        let end;
        oldRoutes.forEach(obj => {
          end = obj.properties.findIndex(
            r => r.key.name == 'path' && r.value.value == node.properties[index].value.value
          );
          if (end >= 0) return;
        });
        if (end < 0) {
          oldRoutes.push(node);
        }
      }
    });
  }

  mergeRoutes();

  injectImports(ast, injectAst);

  return recast.print(ast).code;
}

function handleVueStore(source, imports) {
  let ast = recast.parse(source, {
    parser: require('recast/parsers/babylon')
  });

  let injectAst = recast.parse(imports[0], {
    parser: require('recast/parsers/babylon')
  });

  let oldStore, injectStore;

  recast.types.visit(injectAst, {
    visitVariableDeclaration({ node }) {
      if (
        node.declarations[0].type == 'VariableDeclarator' &&
        node.declarations[0].id.name == 'modules' &&
        node.declarations[0].init.type == 'ObjectExpression'
      ) {
        injectStore = node.declarations[0].init.properties;
      }
      return false;
    }
  });

  recast.types.visit(ast, {
    visitVariableDeclaration({ node }) {
      if (
        node.declarations[0].type == 'VariableDeclarator' &&
        node.declarations[0].id.name == 'modules' &&
        node.declarations[0].init.type == 'ObjectExpression'
      ) {
        oldStore = node.declarations[0].init.properties;
      }
      return false;
    }
  });

  function mergeStore() {
    if (!oldStore || !injectStore) return;

    injectStore.forEach(node => {
      if (node.type == 'ObjectProperty') {
        let index = oldStore.findIndex(s => s.key.name == node.key.name);
        if (index < 0) {
          oldStore.push(node);
        }
      }
    });
  }

  mergeStore();

  injectImports(ast, injectAst);

  return recast.print(ast).code;
}

exports.injectVue = function(file, options = {}) {
  let filePath = path.join(options.cwd, file);
  if (path.isAbsolute(file)) {
    filePath = file;
  }
  let source = fs.readFileSync(filePath, 'utf-8');

  let jsImports = options.js instanceof Set ? Array.from(options.js) : options.js;

  let tplImports =
    options.template instanceof Set ? Array.from(options.template) : options.template;

  let document = parse5.parse(source);

  document.childNodes[0].childNodes[0].childNodes.forEach(element => {
    if (element.nodeName == 'script' && jsImports) {
      element.childNodes[0].value = handleVueJs(element.childNodes[0].value, jsImports);
    } else if (element.nodeName == 'template' && tplImports) {
      element.content.childNodes.forEach(node => {
        if (node.nodeName != '#text') {
          tplImports.forEach(inject => {
            node.childNodes = node.childNodes.concat(
              parse5.parseFragment(`${inject}\n`).childNodes
            );
          });
          return;
        }
      });
    }
  });

  return parse5.serialize(document.childNodes[0].childNodes[0]);
};

exports.injectVueModule = function(file, options = {}) {
  let filePath = path.join(options.cwd, file);
  if (path.isAbsolute(file)) {
    filePath = file;
  }
  let source = fs.readFileSync(filePath, 'utf-8');

  let imports = checkJSFile(file, options);
  if (imports) {
    return handleVueModule(source, imports);
  } else {
    return source;
  }
};

exports.injectVueRoutes = function(file, options = {}) {
  let filePath = path.join(options.cwd, file);
  if (path.isAbsolute(file)) {
    filePath = file;
  }
  let source = fs.readFileSync(filePath, 'utf-8');

  let imports = checkJSFile(file, options);
  if (imports) {
    return handleVueRoutes(source, imports);
  } else {
    return source;
  }
};

exports.injectVueStore = function(file, options = {}) {
  let filePath = path.join(options.cwd, file);
  if (path.isAbsolute(file)) {
    filePath = file;
  }
  let source = fs.readFileSync(filePath, 'utf-8');

  let imports = checkJSFile(file, options);
  if (imports) {
    return handleVueStore(source, imports);
  } else {
    return source;
  }
};
