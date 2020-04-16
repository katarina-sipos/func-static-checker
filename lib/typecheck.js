let self = module.exports = {
    typeEnv: typeEnv = [],
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
                    self.use(statNode, node.firstChild);
                }
            }
        }
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
    usedArgCount: function usedArgCount(app) {
        if (app.namedChildren[1] == null) {
            return 0;
        } else {
            return app.namedChildren[1].namedChildren.length;
        }
    },
    undefinedArgCheck: function undefinedArgCheck(statNode, def) {
        let leaves = [];
        self.check.getAllLeafNodes(statNode[2], leaves);
        let args = [];
        self.check.getAllLeafNodes(statNode[1], args);
        leaves.filter(leaf => leaf.type === 'arg').forEach((item, i) => {
            if (args.some(arg => arg.text === item.text) === false) {
                self.display.undefinedArgError(def);
                return;
            }
        });
    },
    usedArgMismatch: function usedArgMismatch(found, app) {
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
        self.check.getAllLeafNodes(found.arg_list, a);
        a.forEach(i => {
            if (a.filter(value => value.text === i.text).length > 1) {
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
            return true;
        }
        self.check.emptyBody(def, found.name);
        return true;
    },
    argInAppCheck: function argInAppCheck(statNode, app, caller) {
        if (caller != null) return;
        let leaves = [];
        self.check.getAllLeafNodes(statNode[1], leaves);
        if (leaves.some(l => l.type === 'arg')) {
            self.display.undefinedArgError(app);
        }
    },
    define: function define(statNode, def, caller) {
        const found = self.typeEnv.find(fun => fun.name === statNode[0].text);
        self.check.unusedFunctions.push(statNode[0].text);
        if (found == null) {
            self.display.notDeclared(statNode[0]);
            return;
        }
        self.undefinedArgCheck(statNode, def);
        found.body = self.getBody(statNode);
        found.arg_list = self.getArgList(statNode);
        self.check.unusedArg(found.arg_list, found.body, def);
        if (self.argCountMismatch(statNode, found, def)) return;
        self.duplicitArgCheck(found, statNode);
        if (self.hasEmptyBody(statNode, found, def)) return;
        let type;
        found.body.namedChildren.forEach(childNode => {
            type = self.getType(childNode, def, caller);
            if (type !== found.ret_type.firstChild.text) {
                self.display.wrongReturnType(statNode[0], found.ret_type.firstChild, type, def);
            }
        });
    },
    undefinedBody: function undefinedBody(statNode, found) {
        if (found.body === '') {
            self.display.notDefined(statNode[0]);
            return true;
        }
    },
    use: function use(statNode, app, caller) {
        let found = self.typeEnv.find(fun => fun.name === statNode[0].text);
        let index = self.check.unusedFunctions.findIndex(f => f === statNode[0].text);
        delete self.check.unusedFunctions[index];
        if (found == null) {
            self.display.notDeclared(statNode[0]);
            return;
        }
        self.argInAppCheck(statNode, app, caller);
        if (self.undefinedBody(statNode, found)) return;
        if (self.usedArgMismatch(found, app)) return;
        let type;
        if (statNode[1] == null) return;
        for (let i = 0; i < statNode[1].namedChildren.length; i++) {
            type = self.getType(statNode[1].namedChildren[i], app, caller);
            if (found.arg_types.namedChildren[i].text !== type) {
                self.display.wrongArgTypes(found.arg_types, type, app);
                return;
            }
        }
    },
    getType: function getType(toResolve, expr, caller) {
        /*console.log("toResolve: " + toResolve.text);
        console.log("expr: " + expr.text);
        if (caller != null)
            console.log("caller: " + caller.text);*/
        let node = toResolve.firstChild;
        let childNode = node.firstChild;
        if (toResolve.type === 'expression') {
            if (node.type === 'const') {
                return self.getConstType(childNode);
            } else if (node.type === 'arg') {
                const found = self.typeEnv.find(f => f.name === caller); //expr.child(1).text);
                if (found == null || found.arg_list == null) return 'undefined type';
                let arr = [];
                self.check.getAllLeafNodes(found.arg_list, arr);
                const foundArg = arr.find(a => a === node.text);
                const index = arr.findIndex(a => a === foundArg);
                if (found == null || foundArg == null) {
                    return 'undefined type';
                } else {
                    self.check.getAllLeafNodes(found.arg_list, arr);
                    return arr[index];
                }
            } else if (node.type === 'binary_expression' || node.type === 'unary_expression') {
                let info={toReturn:"",expected: "",comparisonFlag:false};
                if(self.resolveNode(childNode,info)===false) return 'undefined type'
                let foundType;
                childNode.namedChildren.forEach(n => {
                    const nType = self.getType(n, expr, caller);
                    if (info.expected === 'alltypes') {
                        info.expected = nType.toString();
                    }
                    if (nType.toString() !== info.expected) {
                        if (info.comparisonFlag)
                            self.display.comparisonMismatch(node);
                        else
                            self.display.illegalOperationError(node, childNode.type, nType);
                        info.toReturn = 'undefined type';
                        return info.toReturn;
                    }
                    self.getType(n, expr, caller)
                });
                return info.toReturn;
            } else if (node.type === 'function_application') {
                let funName = node.child(1).text;
                let index = self.check.unusedFunctions.findIndex(f => f === funName);
                delete self.check.unusedFunctions[index];
                self.use(node.namedChildren, node, caller);
                //self.check.unusedFunctions(funName);
                let found = self.typeEnv.find(f => f.name === funName);
                if (found != null) {
                    let foundRetType = found.ret_type.firstChild.text;
                    return foundRetType;
                }
                if (found == null) {
                    return 'undefined type';
                }
            } else {
                return 'undefined type';
            }
        }
    },
    resolveNode: function resolveNode(node,info){
      if (self.isArithmeticNode(node.type)) {
          info.toReturn= 'int';
          info.expected='int';
      } else if (self.isStringNode(node.type)) {
          info.toReturn='string';
          info.expected='string';
      } else if (self.isBoolNode(node.type)) {
        info.toReturn='bool';
        info.expected='bool';
      } else if (self.isComparisonNode(node.type)) {
          info.toReturn = 'bool';
          info.expected = 'int';
      } else if(self.isEqualNode(node.type)){
        info.expected = 'alltypes';
        info.toReturn='bool';
        info.comparisonFlag=true;
      }
      else {
          return false;
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
        return nodeType === 'less' || nodeType === 'grt' || nodeType === 'leql' || nodeType === 'geql';
    },
    isEqualNode: function isEqualNode(nodeType) {
        return nodeType === 'eql' || nodeType === 'neql';
    },
    getConstType: function getConstType(node) {
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

class Function_stat {
    constructor(name, ret_type, arg_types, arg_list, body) {
        this.name = name;
        this.ret_type = ret_type;
        this.arg_types = arg_types;
        this.arg_list = arg_list;
        this.body = body;
    }
}
