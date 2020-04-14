// TODO: refactoring; type as optional added to grammar.js --here; make error messages great again
let self = module.exports = {
  typeEnv: typeEnv = [],
  c: c = null,
  display: display = require('./display'),
  check: check = require('./check'),
  perform: function perform(statSeq) {
    self.typeEnv = [];
    const statCount = statSeq.childCount;
    for (let i = 0; i < statCount; i++) {
      let node = statSeq.child(i);
      if (node.constructor.name === 'StatementNode') {
        const statNode = node.firstChild.namedChildren;
        if (node.firstChild.type === 'function_declaration') {
          self.declare(statNode);
        } else if (node.firstChild.type === 'function_definition') {
          self.define(statNode, node.firstChild, statNode[0].text);
        } else if (node.firstChild.type === 'function_application') {
          /*  let leafs=[];

              self.check.getAllLeafs(statNode[1],leafs);
              if(leafs.some(l=>l.type=='arg')){
                self.display.undefinedArgError(node);

              }*/
          self.use(statNode, node.firstChild);
        }
      }
    }
    //typeEnv=[];
  },
  declare: function declare(statNode) {
    if (self.check.functionName(statNode[0]) === false) {
      self.display.staticCheckWarning(statNode[0]);
    }
    const found = self.typeEnv.some(fun => fun.name === statNode[0].text);
    if (found) {
      self.display.duplicitDeclaration(statNode[0]); //.text,statNode[0].startPosition,statNode[0].endPosition);
      return;
    }
    self.typeEnv.push(new Function_stat(statNode[0].text, statNode[2], statNode[1], '', ''));
  },
  getBody: function getBody(statNode) {
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
  getArgList: function getArgList(statNode) {
    if (statNode[1] == null || statNode[1].type === 'body') {
      return null;
    }
    return statNode[1];
  },
  definedArgsCount: function definedArgsCount(statNode) {
    if (statNode[1] == null || statNode[1].type === 'body') {
      return 0;
    } else {
      return statNode[1].namedChildren.length;
    }
  },
  declaredArgsCount: function declaredArgsCount(found) {
    if (found.arg_types.text === 'unit') {
      return 0;
    } else {
      return found.arg_types.namedChildren.length;
    }
  },
  usedArgCount: function usedArgCount(app){
    if (app.namedChildren[1] == null) {
      return 0;
    } else {
      return app.namedChildren[1].namedChildren.length;
    }
  },
  undefinedArgCheck: function undefinedArgCheck(statNode, def) {
    let leafs = [];
    self.check.getAllLeafs(statNode[2], leafs);
    let args = [];
    let control = false;
    self.check.getAllLeafs(statNode[1], args);
    leafs.filter(leaf => leaf.type == 'arg').forEach((item, i) => {
      if (args.some(arg => arg.text == item.text) == false) {
        control = true;
        self.display.undefinedArgError(def);
        return;
      }
    });
    return control;
    /*if (!control) {
      self.display.undefinedArgError(def);
      found.body = statNode[1];
      //return;
    }*/
  },
  usedArgMismatch: function usedArgMismatch(found,app){
    if (self.declaredArgsCount(found) !== self.usedArgCount(app)) { // || found.arg_types.namedChildren.length !== numOfUsedArgs) { // arr[1].namedChildren.length){
      self.display.wrongNumOfArgs(app);
      return true;
    }
  },
  argCountMismatch: function argCountMismatch(statNode, found, def) {
    if (self.definedArgsCount(statNode) !== self.declaredArgsCount(found)) {
      self.display.wrongNumOfArgs(def);
      return true;
    }
  },
  duplicitArgCheck: function duplicitArgCheck(found, statNode) {
    if (found.arg_list == null) return;
    let a = [];
    self.check.getAllLeafs(found.arg_list, a);
    a.forEach(i => {
      if (a.filter(value => value.text == i.text).length > 1) {
        self.display.duplicitArg(statNode[0]);
        return;
      }
    });
  },
  hasEmptyBody: function hasEmptyBody(statNode, found, def) {
    if (found.body != null) return;
    let type = 'unit';
    if (type !== found.ret_type.firstChild.text) {
      self.display.wrongReturnType(statNode[0], found.ret_type.firstChild, type, def);
    }
    return true;

    //console.log(found.name);
    //  self.check.emptyBody(def,found.name);
  },
  argInAppCheck: function argInAppCheck(statNode,app,namefrom){
    if (namefrom != null) return;
      let leafs = [];
      self.check.getAllLeafs(statNode[1], leafs);
      if (leafs.some(l => l.type == 'arg')) {
        self.display.undefinedArgError(app);
      }

  },
  define: function define(statNode, def, namefrom) {
    const found = self.typeEnv.find(fun => fun.name === statNode[0].text);
    //self.check.unusedFunctions.push(statNode[0].text);
    if (found == null) {
      self.display.notDeclared(statNode[0]);
      return;
    }
    self.undefinedArgCheck(statNode, def);
    found.body = self.getBody(statNode);
    found.arg_list = self.getArgList(statNode);
    if (self.argCountMismatch(statNode, found, def)) return;
    self.duplicitArgCheck(found, statNode);
    if (self.hasEmptyBody(statNode, found, def)) return;
    let type;
    found.body.namedChildren.forEach(childNode => {
      type = self.determineType(childNode, def, namefrom);
      if (type !== found.ret_type.firstChild.text) {
        self.display.wrongReturnType(statNode[0], found.ret_type.firstChild, type, def);
      }
    });
  },
  undefinedBody: function undefinedBody(statNode,found){
    if (found.body === '') {
      self.display.notDefined(statNode[0]);
      return true;
    }
  },
  use: function use(statNode, app, namefrom) {
    let found = self.typeEnv.find(fun => fun.name === statNode[0].text);
    //  self.check.unusedArg(found,statNode[1]);
    //let index = self.check.unusedFunctions.findIndex(f => f ===statNode[0].text);
    //delete self.check.unusedFunctions[index];
    if (found == null) {
      self.display.notDeclared(statNode[0]);
      return;
    }
    self.argInAppCheck(statNode,app,namefrom);
    if(self.undefinedBody(statNode,found)) return;
    if(self.usedArgMismatch(found,app))return;
    //num of declared arg
    //self.declaredArgsCount(found);
    /*let numOfDefinedArgs = 0;
    if (found.arg_types == 'unit') {
      numOfDefinedArgs = 0;
    } else {
      numOfDefinedArgs = found.arg_types.namedChildren.length;
    }*/
    //let numOfUsedArgs;

    /*if (app.namedChildren[1] == null) {
      numOfUsedArgs = 0;
    } else {
      numOfUsedArgs = app.namedChildren[1].namedChildren.length;
    }*/
    /*if (numOfDefinedArgs !== numOfUsedArgs) { // || found.arg_types.namedChildren.length !== numOfUsedArgs) { // arr[1].namedChildren.length){
      self.display.wrongNumOfArgs(app);
      return;
    }*/
    let type;
    if (statNode[1] == null) return;

    for (let i = 0; i < statNode[1].namedChildren.length; i++) {
      type = self.determineType(statNode[1].namedChildren[i], app, namefrom);
      if (found.arg_types.namedChildren[i].text !== type) {
        self.display.wrongArgTypes(found.arg_types, type, app);
        return;
      }
    }
    //self.check.unusedFunction(self.typeEnv);


  },
  determineType: function determineType(toResolve, expr, namefrom) {
    let node = toResolve.firstChild;
    let childNode = node.firstChild;
    if (toResolve.type === 'expression') {
      if (node.type === 'const') {
        if (childNode.type === 'num_const') {
          return 'int';
        } else if (childNode.type === 'bool_const') {
          return 'bool';
        } else if (childNode.type === 'string_const') {
          return 'string';
        } else {
          return 'undefined type';
        }
      } else if (node.type === 'arg') {
        console.log(namefrom);
        const found = self.typeEnv.find(f => f.name === namefrom); //expr.child(1).text);
        if (found == null || found.arg_list == null) return 'undefined type';
        let arr = found.arg_list.text.split(',');
        const foundArg = arr.find(a => a === node.text);
        const index = arr.findIndex(a => a === foundArg);
        if (found == null || foundArg == null) {
          //self.display.undefinedArgError(expr);
          return 'undefined type';
        } else {
          arr = found.arg_types.text.split(',');
          return arr[index];
        }
      } else if (node.type === 'binary_expression' || node.type === 'unary_expression') {
        let toReturn;
        let expected;
        if (self.isArithmeticNode(childNode.type)) {
          toReturn = expected = 'int';
        } else if (self.isStringNode(childNode.type)) {
          toReturn = expected = 'string';
        } else if (self.isBoolNode(childNode.type)) {
          toReturn = expected = 'bool';
        } else if (self.isComparisonNode(childNode.type)) {
          toReturn = 'bool';
          expected = 'int';
        } else {
          return 'undefined type';
        }
        childNode.namedChildren.forEach(n => {
          const nType = self.determineType(n, expr, namefrom);
          if (nType.toString() !== expected) {
            self.display.illegalOperationError(node, childNode.type, nType);
            toReturn = 'undefined type';
            return toReturn;
          }
          self.determineType(n, expr, namefrom)
        });
        return toReturn;
      } else if (node.type === 'function_application') {
        let funName = node.child(1).text;
        //let index = self.check.unusedFunctions.findIndex(f => f ===funName);
        //delete self.check.unusedFunctions[index];
        self.use(node.namedChildren, node, namefrom);

        //self.check.unusedFunctions(funName);
        let found = self.typeEnv.find(f => f.name === funName);

        if (found != null) {
          /*
          statNode: (function_name),(function_input (expression (function_application (function_name) (function_input (expression (const (string_const)))))))
          /home/katarina/github/func-static-checker/lib/typecheck.js:183 app:  FunctionApplicationNode {0: 2393643552, 1: 6025, 2: 190, 3: 5, 4: 0, 5: 0, tree: Tree}


          */



          //console.log(toResolve.firstChild.namedChildren,toResolve.firstChild);
          //node.firstChild.namedChildren
          //console.log(node.namedChildren.toString());
          //console.log(node.namedChildren[1]);
          //console.log(toResolve.firstChild.namedChildren.toString());
          //console.log(toResolve.firstChild.text);
          //self.use(toResolve.firstChild.namedChildren.toString(),toResolve.firstChild);
          ///self.determineType(toResolve.firstChild.namedChildren[1]);
          // self.use(toResolve.firstChild.namedChildren,expr.namedChildren);
          let foundRetType = found.ret_type.firstChild.text;
          return foundRetType;
        }
        if (found == null) {
          return 'undefined type';
          //self.display.error("eee","");
        }
      } else {
        return 'undefined type';
      }
    }
  },
  isArithmeticNode: function isArithmeticNode(nodeType) {
    return nodeType === 'add' || nodeType === 'mul' || nodeType === 'sub' || nodeType === 'div' || nodeType === 'mod' || nodeType === 'neg';
  },
  isStringNode: function isStringNode(nodeType) {
    return nodeType === 'str_cat';
  },
  isBoolNode: function isBoolNode(nodeType) {
    return nodeType === 'and' || nodeType === 'or' || nodeType === 'not';
  },
  isComparisonNode: function isComparisonNode(nodeType) {
    return nodeType === 'less' || nodeType === 'grt' || nodeType === 'eql' || nodeType === 'leql' || nodeType === 'geql' || nodeType === 'neql';
  }
};

class Function_stat {
  constructor(name, ret_type, arg_types, arg_list, body) {
    this.name = name;
    this.ret_type = ret_type;
    this.arg_types = arg_types;
    this.arg_list = arg_list;
    this.body = body;
  }
}
