
let self = module.exports = {
    display: display = require('./display'),
    treeBuilder: treeBuilder = require('./tree-builder'),
    unusedFunctions: unusedFunctions = [],
    treeOps: treeOps=require('./tree-operations'),
    /**
     * Checks if a function name follow the camelCase notation.
     * If not, the notification is triggered.
     * @param node function name node
     */
    camelCaseCheck: function (node) {
        const regex = /^([a-z]+[A-Z]?)*$/g;
        if(regex.test(node.text)===false){
            self.display.camelCaseWarning(node);
        }
    },
    /**
     * If any of the declared functions is in the unusedFunctions stack,
     * then the unused function notification is triggered.
     * @param typeEnv array of all declared functions in the source code
     */
    unusedFunction: function (typeEnv) {
        typeEnv.forEach(fun => {
            if (self.unusedFunctions.some(f => fun.name === f)) {
                self.display.unusedFunction(fun.name);
            }
        });
    },
    /**
     * Check function body tree to find argument defined in arguments list.
     * If an argument is not in the function body, then the unused argument notification is triggered.
     * @param arg_list root node of the argument list in function definition
     * @param body root node of the function definition
     * @param def node of the whole function definition statement
     */
    unusedArg: function (arg_list, body, def) {
        if (body === null && arg_list !== null) {
            arg_list.namedChildren.forEach(arg => {
                self.display.unusedArg(def, arg.text, def);
            });
            return;
        }
        if (arg_list == null) {
            return;
        }
        let args = [];
        self.treeOps.getAllLeafNodes(arg_list, args);
        let leaves = [];
        self.treeOps.getAllLeafNodes(body, leaves);
        args.forEach(arg => {
            if (leaves.some(i => i.text === arg.text) === false) {
                self.display.unusedArg(def, arg.text, body);
            }
        });
    },
    /**
     * Checks if a function has an empty definition.
     * @param statNode function definition namedChildren array
     * @param found function object from the typeEnv array
     * @param def function definition statement node
     * @returns {boolean} true if empty body defined, false otherwise
     */
    emptyBody: function(statNode, found, def){
        if (found.body != null) return;
        let type = 'unit';
        if (type !== found.ret_type.firstChild.text) {
            self.display.wrongReturnType(statNode[0], found.ret_type.firstChild, type, def);
            return true;
        }
        //self.display.warning('Empty body defined.', 'Function \'' + name + '\' ' + 'has no effect.', node);
        self.display.emptyBodyWarning(def, found.name);
        return true;
    },
    /*emptyBody: function emptyBody(node, name) {
        self.display.warning('Empty body defined.', 'Function \'' + name + '\' ' + 'has no effect.', node);
    },*/
    /**
     *
     * @param fun function object from typeEnv array
     * @param arg function argument node
     * @returns {}
     */
    getArgType: function (fun, arg) {
        let arr = [];
        self.treeOps.getAllLeafNodes(fun.arg_list, arr);
        let foundArg = arr.find(a => a.text == arg.text);
        let index = arr.findIndex(a => a == foundArg);
        arr=[];
        self.treeOps.getAllLeafNodes(fun.arg_types, arr);
        console.log("aa"+typeof arr[index]);
        return arr[index].text;
    },
    /**
     *
     * @param {Function_stat} node1 - a node to be compared with node2
     * @param {Function_stat} node2 - a node to be compared with node1
     */
    compare: function (node1, node2) {

        let result = true;

        let len1 = [];
        let len2 = [];

        self.treeOps.getAllLeafNodes(node1.arg_list, len1);
        self.treeOps.getAllLeafNodes(node2.arg_list, len2);

        if (len1.length !== len2.length) {
            result = false;
            return;
        }
        let leaves1 = [];
        self.treeOps.getAllNodes(node1.body, leaves1);
        let leaves2 = [];
        self.treeOps.getAllNodes(node2.body, leaves2);
        //unused arguments
        len1.forEach(i => {
            if (leaves1.filter(value => value.text === i.text).length === 0) {
                result = false;
                return;
            }
        });
        len2.forEach(i => {
            if (leaves2.filter(value => value.text === i.text).length === 0) {
                result = false;
                return;
            }
        });
        if (result === false) {
            return;
        }
        if (leaves1.length !== leaves2.length) {
            result = false;
            return;
        }
        for (let i = 0; i < leaves1.length; i++) {
            if (leaves1[i].type === leaves2[i].type) {
                if (leaves1[i].type === 'arg') {
                    result = self.getArgType(node1, leaves1[i]) === self.getArgType(node2, leaves2[i]);
                    if (!result) {
                        break;
                    }
                } else if (leaves1[i].type === 'string_const' || leaves1[i].type === 'num_const' || leaves1[i].type === 'bool_const' || leaves1[i].type === 'function_name') {
                    result = leaves1[i].text === leaves2[i].text;
                    if (!result) {
                        break;
                    }
                }
            } else {
                result = false;
                break;
            }
        }
        if (result) {
            self.display.duplicitCode(node1, node2);
        }


    },
    duplicitCode: function () {
        const typecheck = require('./type-check');
        typecheck.typeEnv.forEach(item => {
            if (item.name !== 'ite')
                typecheck.typeEnv.forEach(i => {
                    if (i.name !== 'ite'
                        && item.name !== i.name && item.body !== ''
                        && i.body !== '' && item.body != null && i.body != null)
                        self.compare(item, i);
                });

        });
    },
    conditionExpressionCheck: function (expr) {
        const alwaysTrue = /! *false/g;
        const alwaysFalse = /! *true/g;

        if (expr.text === 'true' || expr.text.match(alwaysTrue)) {
            self.display.alwaysTrue(expr);
        } else if (expr.text === 'false' || expr.text.match(alwaysFalse)) {
            self.display.neverTrue(expr);
        }
    },
    compareTrees: function (root1, root2) {
        if (self.display.errorNodesStack.includes(root1.text)
            || self.display.errorNodesStack.includes(root2.text)) {
            return;
        }
        let nodes1 = self.treeOps.bfs(root1).filter(o => o.content.type === 'expression');
        let nodes2 = self.treeOps.bfs(root2).filter(o => o.content.type === 'expression');
        let result = true;
        if (nodes1.length === nodes2.length) {
            nodes1.forEach((item, i) => {
                if (item.content.text !== nodes2[i].content.text) {
                    result = false;
                    return;
                }
            });
        } else {
            result = false;
        }
        if (result) {
            self.display.duplicitIteBranches(root1);
        }
    },
    isRecursiveCheck: function (node, caller) {
      //  console.log(caller);
        const nodes = self.treeOps.bfs(node);//.filter(n=>n.content.type=='expression');
        nodes.forEach((item, i) => {
            if (item.content.type === 'function_application') {
                if (item.content.namedChildren[0].text === caller) {
                    self.display.recursiveCall(node.parent, caller);
                }
            }
        });
    }
};
