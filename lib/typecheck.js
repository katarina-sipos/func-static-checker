// TODO: refactoring; type as optional added to grammar.js --here; make error messages great again
let self = module.exports = {
    typeEnv: typeEnv = [],
    c: c=null,
    display: display = require('./display'),
    check:    check = require('./check'),
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
        //typeEnv=[];
    },
    declare: function declare(statNode) {
      if(self.check.functionName(statNode[0])===false){
        self.display.staticCheckWarning(statNode[0]);
      }
        const found = self.typeEnv.some(fun => fun.name === statNode[0].text);
        if (found) {
            self.display.duplicitDeclaration(statNode[0]);//.text,statNode[0].startPosition,statNode[0].endPosition);
            return;
        }
        self.typeEnv.push(new Function_stat(statNode[0].text, statNode[2], statNode[1], '', ''));
    },
    define: function define(statNode, def) {
        const found = self.typeEnv.find(fun => fun.name === statNode[0].text);
        //const foo = self.typeEnv.find(fun => fun.name === 'foo');
        //console.log(statNode[1],statNode[2]);

        self.check.unusedFunctions.push(statNode[0].text);

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
            return;
        }
        let type;
        //if(found.body!=null && found.arg_list!=null)
        self.check.unusedArg(found.arg_list,found.body,def);
        //let foo = self.typeEnv.find(fun => fun.name === 'foo');
        /*if(found.name!== foo.name)
        self.check.compare(found,foo);*/
        if(found.arg_list != null){
          let a =[];
           self.check.getAllLeafs(found.arg_list,a);
         a.forEach(i => {

           if(  a.filter(value => value.text==i.text).length >1 ){
             console.log(statNode);
             self.display.duplicitArg(statNode[0]);
             return;
           }
         });


        }
        if (found.body == null) {
            type = 'unit';
            if (type !== found.ret_type.firstChild.text) {
              self.display.wrongReturnType(statNode[0],found.ret_type.firstChild,type,def);
                return;
            }
            //console.log(found.name);
            self.check.emptyBody(def,found.name);
            return;
        }

      /*  if(foo !=null){
          if(foo.name !== found.name){
          if(self.compareArgLists(foo,found)==true){
            self.compare(foo.body,found.body,foo,found);
             console.log(self.c);
          }

          }
        }*/
        //let compareResult;

        /*if(compareResult==null ||compareResult===false ){
          console.log('nie su rovnake');
        }else if(compareResult===true){
          console.log('su rovnake');

        }*/
        //console.log(compareResult);
      //  console.log(foo.body.namedChildren);
      //console.log(foo.body.namedChildren.length);

      //  console.log(found.body.namedChildren);

      //  console.log(found.body.tree);
        //console.log('vysledok porovnania: ');
        //console.log(JSON.stringify(foo.body) == JSON.stringify(found.body));
        found.body.namedChildren.forEach(childNode => {
            type = self.determineType(childNode, def);
            if (type !== found.ret_type.firstChild.text) {
              self.display.wrongReturnType(statNode[0],found.ret_type.firstChild,type,def);
            }
        });
    },
    /*getArgType: function getArgType(node,arg) {
      let arr = node.arg_list.text.split(',');
      let foundArg = arr.find(a => a === arg.text);
      let index = arr.findIndex(a => a === foundArg);
      arr = node.arg_types.text.split(',');
      return arr[index];
    },
    compareArgLists: function compareArgLists(node1,node2){
      let arr1=node1.arg_list.text.split(',');
      let arr2=node2.arg_list.text.split(',');
      let arr1_types=node1.arg_types.text.split(',');
      let arr2_types=node2.arg_types.text.split(',');

      if(arr1.length !==arr2.length){
        return false;
      }
      for(let i=0;i<arr1.length;i++){
        if(arr1_types[i]!==arr2_types[i]){
          return false;
        }
      }
      return true;
    },
    compare: function compare(node,other,one,two) {
      for(let i =0; i< node.namedChildren.length;i++){
        if(node.namedChildren[i].childCount==0 && node.namedChildren[i].childCount==other.namedChildren[i].childCount){
             if(node.namedChildren[i].type==other.namedChildren[i].type){
               if(node.namedChildren[i].type == 'arg'){
                self.c = self.getArgType(one,node.namedChildren[i]) ==self.getArgType(two,other.namedChildren[i]);
               }
             }
        }else{
          self.c =false;
        }
        self.compare(node.namedChildren[i],other.namedChildren[i],one,two);
      }
    },*/
    use: function use(statNode, app) {
        let found = self.typeEnv.find(fun => fun.name === statNode[0].text);
      //  self.check.unusedArg(found,statNode[1]);
      //self.check.unusedFunctions.pop(statNode[0].text);
      let index = self.check.unusedFunctions.findIndex(f => f ===statNode[0].text);
      delete self.check.unusedFunctions[index];
        if (found == null) {
            self.display.notDeclared(statNode[0]);
            return;
        }
        if (found.body === '') {
          self.display.notDefined(statNode[0]);
            return;
        }
        let numOfDefinedArgs=0;
        if (found.arg_types == 'unit') {
          numOfDefinedArgs=0;
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
            self.display.wrongNumOfArgs(app);
            return;
        }
        let type;
        if(statNode[1] == null) return;
        for (let i = 0; i < statNode[1].namedChildren.length; i++) {
            type = self.determineType(statNode[1].namedChildren[i], app);
            if (found.arg_types.namedChildren[i].text !== type) {
              self.display.wrongArgTypes(found.arg_types,type,app);
              return;
            }
        }
        //self.check.unusedFunction(self.typeEnv);


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
                    self.display.undefinedArgError(expr);
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
                    self.display.illegalOperationError(node,childNode.type,nType);
                        toReturn = 'undefined type';
                        return toReturn;
                    }
                    self.determineType(n, expr)
                });
                return toReturn;
            } else if (node.type === 'function_application') {
                let funName = node.child(1).text;
                let index = self.check.unusedFunctions.findIndex(f => f ===funName);
                delete self.check.unusedFunctions[index];
                //self.check.unusedFunctions(funName);
                let found = self.typeEnv.find(f => f.name === funName);

                if (found !=null) {
                  console.log(toResolve.firstChild.namedChildren,toResolve.firstChild);
                  //node.firstChild.namedChildren
                  self.use(toResolve.firstChild.namedChildren,toResolve.firstChild);
                  let foundRetType = found.ret_type.firstChild.text;
                    return foundRetType;
                }
                if(found==null){
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
