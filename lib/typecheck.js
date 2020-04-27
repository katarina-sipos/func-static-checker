let self = module.exports = {
    typeEnv: typeEnv = [],
    display: display = require('./display'),
    check: check = require('./check'),
    trees: trees = [],
    forest: forest = [],
    final: final = [],
    str: str = "",
    result: result = [],
    perform: function perform(statSeq) {
        self.typeEnv = [];
        self.trees = [];
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
                    let toVisit = node.descendantsOfType('expression', node.startPosition, node.endPosition);
                    self.str = "";

                    toVisit = toVisit.sort((a, b) => ((a.parent.text !== b.parent.text) || (a.parent.type !== b.parent.type)) ? 1 : -1);

                    toVisit.forEach((item, i) => {
                        let type = "";
                        if (item.firstNamedChild.type === 'binary_expression') {
                            type = item.firstNamedChild.firstNamedChild.type.toUpperCase();
                        } else if (item.firstNamedChild.type === 'function_application') {
                            type = 'APP';
                        } else {
                            type = 'A';
                        }
                        self.str = self.str + " " + item.text + ': ' + type;
                        //  console.log(item.text+" : "+item.parent.text);
                        if (i < toVisit.length - 1)
                            if ((item.parent.text !== toVisit[i + 1].parent.text) || (item.parent.type !== toVisit[i + 1].parent.type)) {

                                console.log(self.str + ': ' + type);
                                self.result.push(self.str)
                                //  self.result=self.str+': '+type+'<br>'+self.result;
                                //console.log("________");
                                self.str = "";
                                //  console.log("____");
                            }


                    });
                    let type = "";
                    if (toVisit[toVisit.length - 1].firstNamedChild.type === 'binary_expression') {
                        type = toVisit[toVisit.length - 1].firstNamedChild.firstNamedChild.type.toUpperCase();
                    } else if (toVisit[toVisit.length - 1].firstNamedChild.type === 'function_application') {
                        type = 'APP';
                    } else {
                        type = 'A';
                    }
                    self.result.push(self.str);
                    //self.result=self.str+': '+type+'<br>';
                    console.log(self.str + ': ' + type);
                    console.log("________");
                    self.result.push(node.text + ' : APP');
                    console.log(node.text + ' : APP');


                    /*
                    self.populate(node);
                    let sizes=[];
                    self.forest=self.forest.filter(i=>i.length>0);
                    self.forest.forEach((item, i) => {
                      sizes.push(item.length);
                    });
                    let line="_";

                        // 3
                        let arr=[];
                    let len =Math.max.apply(Math, sizes);
                    for(let i=0;i<len;i++){
                      let str="";
                      self.forest.filter((item,j)=>{
                        if(item[i]!=null){
                        //  console.log(item[i]);
                          str=str+'&emsp;' +item[i];
                        }else{
                          str =str+'&emsp;'
                        }
                      });
                      arr.push(str);
                    }
                    self.final=self.final+ "<br>";
                    //console.log("_____");

                    arr.reverse().forEach((item, i) => {
                      self.final=self.final+item+'<br>';

                      //console.log(item);
                      self.final=self.final+" <br>";

                    //  console.log("_____");
                    });
                    //console.log(node.firstChild.text);
                    self.final=self.final + '<span style="text-decoration:overline">'+node.firstChild.text+'</span>'+ '&ensp;APP'.bold() +'<br>';
                    self.final=self.final+'<br><br>'
                    self.trees = [];
                    self.forest =[];*/

                    self.use(statNode, node.firstChild);

                }
            }
        }
    },
    populate: function populate(node) {

        if (node.firstChild.type == 'function_application') {
            node.firstNamedChild.namedChildren[1].namedChildren.forEach((item, i) => {
                if (item.namedChildren.length > 1 || item.firstNamedChild.type !== 'const') {
                    /*if(node.firstNamedChild.type=='binary_expression'){
                      console.log(node.text+" : "+node.firstNamedChild.firstNamedChild.type);

                    }else{
                      console.log(node.text+" : "+node.firstNamedChild.type);
                    }*/
                    if (item.firstNamedChild.type === 'function_application') {
                        self.trees.push('<span style="text-decoration:overline">' + item.text + '</span>' + '&nbsp;APP'.bold());
                    }
                    if (item.firstNamedChild.type === 'binary_expression') {
                        self.trees.push('<span style="text-decoration:overline">' + item.text + '</span>' + '&nbsp;' + item.firstNamedChild.firstNamedChild.type.toUpperCase().bold());
                    }
                    //  console.log(item.text+": "+item.firstNamedChild.type);
                    //self.trees.push(item.text);

                }
                self.populate(item);

                //console.log(item.text+"  : "+item.namedChildren.length +" : "+item.firstNamedChild.type);

            });

        } else if (node.firstNamedChild.type == 'const') {

            let a = [];
            self.check.getAllLeafNodes(node, a);
            let str = "";
            a.forEach((item, i) => {
                if (item.type === 'num_const' || item.type === 'string_const' || item.type === 'bool_const') {
                    str = str + '<span style="text-decoration:overline">' + item.text + '</span>' + '&nbspA'.bold();
                }
                //  str=str + ' '+item.text+": "+item.type;
            });
            self.trees.push(str);
            //self.trees.push(a.map(i => i.text).join());

            //console.log(a.map(i => i.text).join());
        }
        //  console.log(self.trees);
        self.forest.push(self.trees);
        self.trees = [];
    },
    bfs: function bfs(node) {
        if (node == null) return;
        //if (self.visited.length == 0) return;
        //  if (node.type != 'function_name') {
        /*let item = {
          name: node.text,
          parent: node.parent.text
        };
        if (node.text !== node.parent.text)
          self.trees.push(item);*/
        console.log(node.text);

        //}
        if (node.namedChildren.length == 0) {
            let index = self.visited.findIndex(f => f.text === node.text);
            delete self.visited[index];
        }
        if (node.nextNamedSibling == null) {
            self.bfs(node.parent.firstNamedChild.firstNamedChild);

        } else {
            self.bfs(node.nextNamedSibling);
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
    loopThrough: function loopThrough(root) {
        if (root == null) return;
        root.namedChildren.forEach((item, i) => {
            console.log(item.text);
        });
        self.loopThrough(root.firstNamedChild);
    },
    use: function use(statNode, app, caller) {
        //console.log(statNode[1].text);
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
        statNode[1].namedChildren.forEach((item, i) => {
            type = self.getType(item, app, caller);
            if (found.arg_types.namedChildren[i].text !== type) {
                self.display.wrongArgTypes(found.arg_types, type, app);
                return;
            }
        });
    },
    getType: function getType(toResolve, expr, caller) {
        let node = toResolve.firstChild;
        let childNode = node.firstChild;
        //console.log(node.text);

        /*if(caller==null){
        if(self.trees.hasOwnProperty(expr.text) ==false){
          self.trees[expr.text]=[];
        }
          self.trees[expr.text].push(toResolve.text);
        }*/
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
                return self.getAppType(node, caller);
            } else {
                return 'undefined type';
            }
        }
    },
    getAppType: function getAppType(node, caller) {
        let funName = node.child(1).text;
        let index = self.check.unusedFunctions.findIndex(f => f === funName);
        delete self.check.unusedFunctions[index];
        self.use(node.namedChildren, node, caller);
        let found = self.typeEnv.find(f => f.name === funName);
        if (found != null) {
            return found.ret_type.firstChild.text;
        }
        if (found == null) {
            return 'undefined type';
        }
    },
    getArgType: function getArgType(caller, node) {
        const found = self.typeEnv.find(f => f.name === caller); //expr.child(1).text);
        if (found == null || found.arg_list == null) return 'undefined type';
        let arr = [];
        self.check.getAllLeafNodes(found.arg_list, arr);
        const foundArg = arr.find(a => a.text === node.text);
        if (foundArg == null) return 'undefined type';
        const index = arr.findIndex(a => a.text === foundArg.text);
        if (found == null || foundArg == null) {
            return 'undefined type';
        } else {
            let a = [];
            self.check.getAllLeafNodes(found.arg_types, a);
            return a[index].text;
        }
    },
    resolveNode: function resolveNode(node, info) {
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
