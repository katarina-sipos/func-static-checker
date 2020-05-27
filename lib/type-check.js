let self = module.exports = {
  typeEnv: typeEnv = [],
  display: display = require('./display'),
  check: check = require('./check'),
  treeOps: treeOps = require('./tree-operations'),
  Function_stat: Function_stat = require('./Function_stat'),
  treeBuilder: treeBuild = require('./tree-builder'),
  /**
   * Adds ite function forms to the typeEnv array.
   * It predefines the function so that undeclared or undefined
   * errors are not triggered.
   */
  predefineIte: function() {
    self.typeEnv.push(new Function_stat('ite', 'int', ['bool', 'int', 'int'], ['u', 'x', 'x'], 'x'));
    self.typeEnv.push(new Function_stat('ite', 'bool', ['bool', 'bool', 'bool'], ['u', 'x', 'x'], 'x'));
    self.typeEnv.push(new Function_stat('ite', 'string', ['bool', 'string', 'string'], ['u', 'x', 'x'], 'x'));
  },
  init: function init() {
    self.typeEnv = [];
    self.predefineIte();
    self.trees = [];
    self.cluster = [];
  },
  /**
   * Iterates over statSequence children elements.
   * Each element represents a statement in the source code.
   * The given element is then analysed according to its type.
   * @param statSeq - statement sequence node from the parse tree
   */
  perform: function(statSeq) {
    self.init();
    const statCount = statSeq.childCount;
    for (let i = 0; i < statCount; i++) {
      let node = statSeq.child(i);
      if (node.constructor.name === 'StatementNode') {
        const statNode = node.firstChild.namedChildren;
        if (node.firstChild.type === 'function_declaration') {
          self.declare(statNode);
        } else if (node.firstChild.type === 'function_definition') {
          self.define(node.firstChild);
        } else if (node.firstChild.type === 'function_application') {
          self.use(node.firstChild);
          self.treeBuilder.buildTree(statNode[1], node);
        }
      }
    }
  },
  isDeclared: function(node) {
    return self.typeEnv.some(fun => (fun.name === node.text));
  },
  /**
   * Handles function declaration statement.
   * If the function is not already declared, new function object is pushed to the typeEnv array.
   * @param statNode - array of the function declaration named children that form the declaration itself
   */
  declare: function(statNode) {
    self.check.camelCaseCheck(statNode[0]);
    if (self.isDeclared(statNode[0])) {
      self.display.duplicitDeclaration(statNode[0]);
      return;
    }
    self.typeEnv.push(new Function_stat(statNode[0].text, statNode[2], statNode[1], '', ''));
  },
  /**
   * Function body i snot always the same named children node.
   * E.g. In a function with empty body it may vary.
   * @param statNode - function definition named children array
   * @returns {null|object} - returns node object of the body of the fucntion definition
   */
  getBody: function(statNode) {
    if (statNode[1] == null && statNode[2] == null) {
      return null;
    } else if (statNode[1].type === 'arg_list' && statNode[2] == null) {
      return null;
    } else if (statNode[1].type === 'body' && statNode[2] == null) {
      return statNode[1];
    } else if (statNode[1].type === 'arg_list' && statNode[2].type === 'body') {
      return statNode[2];
    }
  },
  /**
   * Returns node object with argument list from function definition.
   * @param statNode - array of node children
   * @returns {null|*} - returns node object with arguments or null if no arguments are listed
   */
  getArgList: function(statNode) {
    if (statNode[1] == null || statNode[1].type === 'body') {
      return null;
    }
    return statNode[1];
  },
  /**
   * Returns number of arguments in a function definition.
   * @param statNode - function definition node named children
   * @returns {number} - number of arguments in a function definition
   */
  definedArgsCount: function(statNode) {
    if (statNode[1] == null || statNode[1].type === 'body') {
      return 0;
    }
    return statNode[1].namedChildren.length;
  },
  /**
   * Returns number of declared arguments type.
   * @param found - function object from the typeEnv array containing declared function.
   * @returns {number} - number of declared argument types
   */
  declaredArgsCount: function(found) {
    if (found.arg_types.text === 'unit') {
      return 0;
    }
    return found.arg_types.namedChildren.length;
  },
  /**
   * Returns number of function intros.
   * @param app - function application node
   * @returns {number} - number of function intros
   */
  usedArgCount: function(app) {
    if (app.namedChildren[1] == null) {
      return 0;
    }
    return app.namedChildren[1].namedChildren.length;
  },
  /**
   * Checks if the are arguments in the body that are not defined in the function scope.
   * @param statNode - array of named children that form the definition statement itself
   * @param def -definition statement node
   */
  undefinedArgCheck: function(statNode, def) {
    let leaves = [];
    self.treeOps.getAllLeafNodes(statNode[2], leaves);
    let args = [];
    self.treeOps.getAllLeafNodes(statNode[1], args);
    leaves.filter(leaf => leaf.type === 'arg').forEach(item => {
      if (args.some(arg => arg.text === item.text) === false) {
        self.display.undefinedArgError(def);
        return;
      }
    });
  },
  /**
   * Compares number of declared types of arguments with used arguments
   * @param found - function object from typeEnv array
   * @param app - function application statement node
   * @returns {boolean} - true if the declared types number and used function intros differ, false otherwise
   */
  usedArgMismatch: function(found, app) {
    if (self.declaredArgsCount(found) !== self.usedArgCount(app)) {
      self.display.wrongNumOfArgs(app);
      return true;
    }
  },
  /**
   * Compares number of defined arguments with number declared types.
   * @param statNode - array of function definition statement named children
   * @param fun - function object from typeEnv array
   * @param def - function definition statement
   * @returns {boolean} - true if the numbers of defined and declared arguments differ, false otherwise
   */
  argCountMismatch: function(statNode, fun, def) {
    if (self.definedArgsCount(statNode) !== self.declaredArgsCount(fun)) {
      self.display.wrongNumOfArgs(def);
      return true;
    }
  },
  /**
   * Checks if the are any repetitive argument names.
   * @param fun - function object from typeEnv
   * @param statNode - function definition named children nodes array
   */
  duplicitArgCheck: function(fun, statNode) {
    if (fun.arg_list == null) return;
    let a = [];
    self.treeOps.getAllLeafNodes(fun.arg_list, a);
    a.forEach(i => {
      if (a.filter(value => value.text === i.text).length > 1) {
        self.display.duplicitArg(statNode[0]);
        return true;
      }
    });
  },
  /***
   * If the is any argument in function application outside a function definition.
   * @param statNode - function application named children nodes array
   * @param app - function application statement
   * @param caller - the statement in which the function is called.
   */
  argInAppCheck: function argInAppCheck(statNode, app, caller) {
    if (caller != null) return;
    let leaves = [];
    self.treeOps.getAllLeafNodes(statNode[1], leaves);
    if (leaves.some(l => l.type === 'arg')) {
      self.display.undefinedArgError(app);
    }
  },
  /**
   * Definition statement without previous declaration of a function.
   * @param def - function object from typeEnv
   * @param node - definition statement node
   * @returns {boolean}
   */
  notDeclaredDef: function(def, node) {
    if (def == null) {
      self.display.notDeclared(node);
      return true;
    }
  },
  defArgError: function(found, statNode, def) {
    self.undefinedArgCheck(statNode, def);
    self.check.unusedArg(found.arg_list, found.body, def);
    if (self.argCountMismatch(statNode, found, def)) return true;
    if (self.duplicitArgCheck(found, statNode)) return true;
  },
  /**
   * Checks if a function is already in typeEnv with defined body.
   * @param found - function object from typeEnv array
   * @returns {boolean} - true if already defined, false otherwise
   */
  redefinitionError: function(found) {
    if (found.body !== '') {
      return true;
    }
  },
  /**
   * Handles function definition statement in the source code.
   * Adds its body from the tree to the function object in the type environment.
   * @param def - function definition node.
   */
  define: function(def) {
    let statNode = def.namedChildren;
    let found = self.typeEnv.find(fun => fun.name === statNode[0].text);
    if (self.notDeclaredDef(found, statNode[0])) return;
    if (self.redefinitionError(found)) return;
    self.check.unusedFunctions.push(statNode[0].text);
    found.body = self.getBody(statNode);
    found.arg_list = self.getArgList(statNode);
    if (self.defArgError(found, statNode, def)) return;
    self.functionBodyCheck(found, def, statNode[0].text, statNode);
  },
  /**
   * Type checking the function definition body.
   * @param found - function object from typeEnv array
   * @param def - function definition node
   * @param caller - function itself
   * @param statNode - named children array of the function definition statement node
   */
  functionBodyCheck: function(found, def, caller, statNode) {
    if (self.check.emptyBody(statNode, found, def)) return;
    self.check.isRecursiveCheck(found.body, caller);
    let type;
    found.body.namedChildren.forEach(childNode => {
      type = self.getType(childNode, caller);
      if (type !== found.ret_type.firstChild.text) {
        self.display.wrongReturnType(statNode[0], found.ret_type.firstChild, type, def);
      }
    });
  },
  /**
   * Return value indicating that a function has an implementation.
   * @param statNode - function definition named children array
   * @param found - function object from typeEnv
   * @returns {boolean} - return true if function does not have an implementation, false otherwise
   */
  undefinedBody: function(statNode, found) {
    if (found.body !== '') return false;
    self.display.notDefined(statNode[0]);
    return true;
  },
  /**
   * Ite is a function application. If standing alone in the source code, there should be no arguments.
   * @param node - ite function application node
   * @param caller - function node inside which the ite is called
   */
  argInIte: function(node, caller) {
    if (caller != null) return;
    node.namedChildren.forEach(item => {
      if (self.treeOps.bfs(item).some(
          t => t.content.type === 'arg')) {
        self.display.undefinedArgError(node);
      }
    });
  },
  handleIfThenElse: function(node, app, caller) {
    if (node == null) {
      self.display.emptyIteCall(app);
      return 'undefined type';
    }
    if (node.namedChildren.length !== 3) {
      self.display.wrongNumOfArgs(app);
      return 'undefined type';
    }
    let inputs = node.namedChildren.map(o => self.getType(o, caller));
    if (inputs[0] !== 'bool') {
      self.display.conditionNotBool(node, inputs[0]);
      return 'undefined type';
    }
    self.argInIte(node, app, caller);
    if (inputs[1] !== inputs[2]) {
      self.display.branchesTypesMismatch(inputs[1], inputs[2], node);
      return 'undefined type';
    }
    self.check.compareTrees(node.namedChildren[1], node.namedChildren[2]);
    self.check.conditionExpressionCheck(node.firstNamedChild);
    return inputs[1];
  },
  /**
   * Funtion application of an undefined function.
   * @param app - function object from typeEnv
   * @param node - function application node
   * @returns {boolean} - true if function is not declared, false otherwise
   */
  notDeclaredUse: function(app, node) {
    if (app == null) {
      self.display.notDeclared(node);
      return true;
    }
  },
  /**
   * If a function is used, it is deleted form unused functions stack.
   * @param node - function name node from function application
   */
  deleteFromUnused: function(node) {
    const index = self.check.unusedFunctions.findIndex(f => f === node.text);
    delete self.check.unusedFunctions[index];
  },
  /**
   * Handles function application.
   * @param app - function application node
   * @param caller - function, in which the function is called. Null in solely function calls.
   */
  use: function(app, caller) {
    let statNode = app.namedChildren;
    if (statNode[0].text === 'ite') {
      self.handleIfThenElse(statNode[1], app, caller);
      return;
    }
    let found = self.typeEnv.find(fun => fun.name === statNode[0].text);
    self.deleteFromUnused(statNode[0]);
    if (self.notDeclaredUse(found, statNode[0])) return;
    self.argInAppCheck(statNode, app, caller);
    if (self.undefinedBody(statNode, found)) return;
    if (self.usedArgMismatch(found, app)) return;
    let type;
    if (statNode[1] == null) return;
    statNode[1].namedChildren.forEach((item, i) => {
      type = self.getType(item, caller);
      if (found.arg_types.namedChildren[i].text !== type) {
        self.display.wrongArgTypes(found.arg_types, type, app);
        return;
      }
    });
  },
  /**
   * Main function for discerning an expression type.
   * @param toResolve - expression to by annotated with type
   * @param caller - function that called specific expression - function application
   * @returns {string} - string with an expression type
   */
  getType: function(toResolve, caller) {
    let node = toResolve.firstChild;
    let childNode = node.firstChild;
    if (toResolve.type === 'expression') {
      if (node.type === 'const') {
        return self.getConstType(childNode);
      } else if (node.type === 'arg') {
        return self.getArgType(caller, node);
      } else if (node.type === 'binary_expression' || node.type === 'unary_expression') {
        let info = {
          toReturn: "",
          expected: "",
          comparisonFlag: false
        };
        if (self.resolveNode(childNode, info) === false) return 'undefined type';
        childNode.namedChildren.forEach(n => {
          const nType = self.getType(n, caller);
          if (info.expected === 'alltypes') {
            info.expected = nType.toString();
          }
          if (nType.toString() !== info.expected) {
            if (info.comparisonFlag) {
              self.display.comparisonMismatch(node);
            } else {
              self.display.illegalOperationError(node, childNode.type, nType);
            }
            info.toReturn = 'undefined type';
            return info.toReturn;
          }
          self.getType(n, caller);
        });
        return info.toReturn;
      } else if (node.type === 'function_application') {
        return self.getAppType(node, caller);
      } else {
        return 'undefined type';
      }
    }
  },
  /**
   * Fun tion application type is based on the declaration of the called function.
   * @param node - function application node
   * @param caller - who calls the function
   * @returns {string} - string with function return type
   */
  getAppType: function(node, caller) {
    const funName = node.child(1).text;
    if (funName === 'ite') {
      return self.handleIfThenElse(node.namedChildren[1], node, caller);
    }
    const index = self.check.unusedFunctions.findIndex(f => f === funName);
    delete self.check.unusedFunctions[index];
    self.use(node, caller);
    const found = self.typeEnv.find(f => f.name === funName);
    if (found) {
      return found.ret_type.firstChild.text;
    }
    return 'undefined type';
  },
  /**
   * Discerns function argument type.
   * @param caller - function name in which the argument occurs
   * @param node - argument parse tree node
   * @returns {string} - type of an argument in a string representation
   */
  getArgType: function(caller, node) {
    const found = self.typeEnv.find(f => f.name === caller);
    if (found == null || found.arg_list == null) return 'undefined type';
    let arr = [];
    self.treeOps.getAllLeafNodes(found.arg_list, arr);
    const foundArg = arr.find(a => a.text === node.text);
    if (foundArg == null) return 'undefined type';
    const index = arr.findIndex(a => a.text === foundArg.text);
    if (found == null || foundArg == null) {
      return 'undefined type';
    } else {
      let a = [];
      self.treeOps.getAllLeafNodes(found.arg_types, a);
      return a[index].text;
    }
  },
  /**
   * What arguments does an binary operation node expects
   * and what does it return if expected arguments are provided.
   * @param node - binary operation node
   * @param info - information object for getType method about the operation semantics
   * @returns {boolean} - false if the node cannot be resolved
   */
  resolveNode: function(node, info) {
    if (self.isArithmeticNode(node.type)) {
      info.toReturn = 'int';
      info.expected = 'int';
    } else if (self.isStringNode(node.type)) {
      info.toReturn = 'string';
      info.expected = 'string';
    } else if (self.isBoolNode(node.type)) {
      info.toReturn = 'bool';
      info.expected = 'bool';
    } else if (self.isComparisonNode(node.type)) {
      info.toReturn = 'bool';
      info.expected = 'int';
    } else if (self.isEqualNode(node.type)) {
      info.expected = 'alltypes';
      info.toReturn = 'bool';
      info.comparisonFlag = true;
    } else {
      return false;
    }
  },
  isArithmeticNode: function(nodeType) {
    return nodeType === 'add' || nodeType === 'mul' || nodeType === 'sub' || nodeType === 'div' || nodeType === 'mod' || nodeType === 'neg';
  },
  isStringNode: function(nodeType) {
    return nodeType === 'str_cat';
  },
  isBoolNode: function(nodeType) {
    return nodeType === 'and' || nodeType === 'or' || nodeType === 'not';
  },
  isComparisonNode: function(nodeType) {
    return nodeType === 'less' || nodeType === 'grt' || nodeType === 'leql' || nodeType === 'geql';
  }, 
  isEqualNode: function(nodeType) {
    return nodeType === 'eql' || nodeType === 'neql';
  },
  getConstType: function(node) {
    if (node.type === 'num_const') {
      return 'int';
    } else if (node.type === 'bool_const') {
      return 'bool';
    } else if (node.type === 'string_const') {
      return 'string';
    } else {
      return 'undefined type';
    }
  }
};
