// TODO: refactoring; type as optional added to grammar.js --here; make error messages great again
let self = module.exports = {
    typeEnv: typeEnv = [],
    display: display = require('./display'),
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
                    self.define(statNode, node.firstChild);
                } else if (node.firstChild.type === 'function_application') {
                    self.use(statNode, node.firstChild);
                }
            }
        }
    },
    declare: function declare(statNode) {
        const found = self.typeEnv.some(fun => fun.name === statNode[0].text);
        if (found) {
            self.display.duplicitDeclaration(statNode[0]);//.text,statNode[0].startPosition,statNode[0].endPosition);
            return;
        }
        self.typeEnv.push(new Function_stat(statNode[0].text, statNode[2], statNode[1], '', ''));
    },
    define: function define(statNode, def) {
        const found = self.typeEnv.find(fun => fun.name === statNode[0].text);
        if (found == null) {
            self.display.notDeclared(statNode[0]);
            return;
        }
        let numOfDefinedArgs;
        let numOfDeclaredTypes;
        if (found.arg_types.text === 'unit') {
            numOfDeclaredTypes = 0;
        } else {
            numOfDeclaredTypes = found.arg_types.namedChildren.length;
        }
        if (statNode[1] == null && statNode[2] == null) {
            numOfDefinedArgs = 0;
            found.body = null;
            found.arg_list = null;
        } else if (statNode[1].type === 'arg_list' && statNode[2] == null) {
            numOfDefinedArgs = statNode[1].namedChildren.length;
            found.body = null;
            found.arg_list = statNode[1];

        } else if (statNode[1].type === 'body' && statNode[2] == null) {
            numOfDefinedArgs = 0;
            found.body = statNode[1];
            found.arg_list = null;
        } else if (statNode[1].type === 'arg_list' && statNode[2].type === 'body') {
            numOfDefinedArgs = statNode[1].namedChildren.length;
            found.arg_list = statNode[1];
            found.body = statNode[2];
        }
        if (numOfDefinedArgs !== numOfDeclaredTypes) {
            self.display.wrongNumOfArgs(def);
            //self.display.error('Wrong number of arguments in \'' + def.text + '\'.');
            return;
        }
        let type;
        if (found.body == null) {
            type = 'unit';
            if (type !== found.ret_type.firstChild.text) {
              let details = 'Expected return type for \'' + statNode[0].text + '\' is ' + found.ret_type.firstChild.text;
              details = details + '. Defined body might result in \'' + type + '\'.';
                self.display.error('Type error in \'' + def.text + '\'.', details);
                return;
            }
            return;
        }
        found.body.namedChildren.forEach(childNode => {
            type = self.determineType(childNode, def);
            if (type !== found.ret_type.firstChild.text) {
              let details = 'Expected return type for \'' + statNode[0].text + '\' is ' + found.ret_type.firstChild.text;
              details = details + '. Defined body might result in \'' + type + '\'.';
                self.display.error('Type error in \'' + def.text + '\'.', details);
            }
        });
    },
    use: function use(statNode, app) {
        let found = self.typeEnv.find(fun => fun.name === statNode[0].text);
        if (found == null) {
            self.display.notDeclared(statNode[0]);
            //self.display.error('Function \'' + statNode[0].text + '\' is not declared.');
            return;
        }
        if (found.body === '') {
          self.display.notDefined(statNode[0]);
          //  self.display.error('Function \'' + statNode[0].text + '\' not defined.');
            return;
        }
        let numOfDefinedArgs=0;
        if (found.arg_types == 'unit') {
          //console.log("lll");
          numOfDefinedArgs=0;
            //return;
        }else{
          numOfDefinedArgs=found.arg_types.namedChildren.length;
        }
      let numOfUsedArgs;

      if (app.namedChildren[1] == null) {
            numOfUsedArgs = 0;
        } else {
            numOfUsedArgs = app.namedChildren[1].namedChildren.length;
        }
        if (numOfDefinedArgs !== numOfUsedArgs){// || found.arg_types.namedChildren.length !== numOfUsedArgs) { // arr[1].namedChildren.length){
            //self.display.error('Wrong number of arguments in \'' + app.text + '\'.');
            self.display.wrongNumOfArgs(app);
            return;
        }
        let type;
        if(statNode[1] == null) return;
        for (let i = 0; i < statNode[1].namedChildren.length; i++) {
            type = self.determineType(statNode[1].namedChildren[i], app);
            if (found.arg_types.namedChildren[i].text !== type) {
              self.display.wrongArgTypes(found.arg_types,type,app);
                /*let details = 'Expected types of agruments: \'' + found.arg_types.text + '\'. ';
                details = details + 'Found: ' + type;
                self.display.error('Type error in \'' + app.text + '\'', details);*/

                return;
            }
        }
    },
    determineType: function determineType(toResolve, expr) {
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
              const found = self.typeEnv.find(f => f.name === expr.child(1).text);
              if (found.arg_list == null) return 'undefined type';
              let arr = found.arg_list.text.split(',');
              const foundArg = arr.find(a => a === node.text);
              const index = arr.findIndex(a => a === foundArg);
              if (found == null || foundArg == null) {
                    self.display.error('Undefined function argument used in \'' + expr.text + '\'');
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
                  const nType = self.determineType(n, expr);
                  if (nType.toString() !== expected) {
                      let details = '\'' + childNode.type + '\'';
                      details = details + ' cannot be applied to type \''
                        details = details + nType.toString() + '\'';
                        self.display.error('Type error in  ' + node.text, details);
                        toReturn = 'undefined type';
                        return toReturn;
                    }
                    self.determineType(n, expr)
                });
                return toReturn;
            } else if (node.type === 'function_application') {
                let funName = node.child(1).text;
                let found = self.typeEnv.find(f => f.name === funName);

                if (found != null) {
                  let foundRetType = found.ret_type.firstChild.text;
                    return foundRetType;
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
