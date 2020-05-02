let self = module.exports = {
  display: display = require('./display'),
  treeBuilder: treeBuilder = require('./treeBuilder'),
  unusedFunctions: unusedFunctions = [],
  functionName: function functionName(node) {
    const regex = /^([a-z]+[A-Z]?)*$/g;
    return regex.test(node.text);
  },
  unusedFunction: function unusedFunction(typeEnv) {
    typeEnv.forEach(fun => {
      if (self.unusedFunctions.some(f => fun.name === f)) {
        self.display.unusedFunction(fun.name);
      }
    });
  },
  unusedArg: function unusedArg(arg_list, body, def) {
    if(body ===null && arg_list!==null){
      arg_list.namedChildren.forEach(arg => {
        self.display.unusedArg(def, arg.text, def);
      });
      return;
    }
    if(arg_list==null){
      return;
    }
    let args = [];
    self.getAllLeafNodes(arg_list, args);
    let leaves = [];
    self.getAllLeafNodes(body, leaves);
    args.forEach(arg => {
      if(leaves.some(i => i.text == arg.text) === false){
        self.display.unusedArg(def, arg.text, body);
      }
    });
  },
  getAllLeafNodes: function getAllLeafNodes(node, leaves) {
    if(node==null) {
      leaves=[];
      return;
    }
    for (let i = 0; i < node.namedChildren.length; i++) {
      if (node.namedChildren[i].namedChildren.length === 0) {
        leaves.push(node.namedChildren[i]);
      }
      self.getAllLeafNodes(node.namedChildren[i], leaves);
    }
  },
  getAllNodes: function getAllNodes(root,arr) {
    for (let i = 0; i < root.namedChildren.length; i++) {
      arr.push(root.namedChildren[i]);
      self.getAllNodes(root.namedChildren[i],arr);
    }
  },
  emptyBody: function emptyBody(node,name) {
    self.display.warning('Empty body defined.','Function \''+name+'\' '+'has no effect.',node);
  },
  getArgType: function getArgType(node,arg) {
    let arr=[] ;
    self.getAllLeafNodes(node.arg_list,arr);
    let foundArg = arr.find(a => a === arg.text);
    let index = arr.findIndex(a => a === foundArg);
    self.getAllLeafNodes(node.arg_types,arr);
    return arr[index];
  },
  compare: function compare(node1,node2) {

    let result=true;

    let len1=[];
    let len2=[];

    self.getAllLeafNodes(node1.arg_list,len1);
    self.getAllLeafNodes(node2.arg_list,len2);

    if(len1.length!==len2.length){
      result=false;
      //console.log(result);
      return;
    }
    let leaves1=[];
    self.getAllNodes(node1.body,leaves1);
    let leaves2=[];
    self.getAllNodes(node2.body,leaves2);
    //unused arguments
    len1.forEach(i => {

      if(  leaves1.filter(value => value.text==i.text).length ==0 ){
        //console.log('unused arg');
        result=false;

        return;
      }

    });
    len2.forEach(i => {

      if(  leaves2.filter(value => value.text==i.text).length ==0 ){
        //console.log('unused arg');
        result=false;

        return;
      }
    });
    if(result===false){
      return;
    }


    if(leaves1.length !== leaves2.length){
      result=false;
      //console.log(result);
      return;
    }


    for(let i =0;i<leaves1.length;i++){
      //console.log(leaves1[i].type);

        if(leaves1[i].type ===leaves2[i].type ){

          //console.log(leaves1[i].type+' , '+leaves2[i].type+' rovnaky type');
          //result=true;
          if(leaves1[i].type==='arg'){
            result =self.getArgType(node1,leaves1[i]) ==self.getArgType(node2,leaves2[i]);
            if(!result){
              break;
            }
          }else if(leaves1[i].type==='string_const'|| leaves1[i].type==='num_const'|| leaves1[i].type==='bool_const' || leaves1[i].type==='function_name'){
            result = leaves1[i].text ===leaves2[i].text;
            if(!result){
              break;
            }
          }
          /*else if(leaves1[i].type==='function_name' ){
            if()
          }*/
        }
        else{
          result=false;
          break;
        }

      //self.compare(body1.namedChildren[i],body2.namedChildren[i]);

    }
    //console.log(result);
    if(result){
      self.display.duplicitCode(node1,node2);
      //console.log('Functions \''+node1.name+'\' and '+'\''+node2.name+'\' might be identical.');
    }


  },
  duplicitCode: function duplicitCode(){
    const typecheck = require('./typecheck');

    typecheck.typeEnv.forEach(item => {
      if(item.name!=='ite')
      typecheck.typeEnv.forEach(i => {
        if(i.name!=='ite' && item.name!== i.name && item.body!='' && i.body !='' && item.body!=null && i.body !=null)
         self.compare(item,i);
      });

    });
  },
  alwaysTrueExpression: function alwaysTrueExpression(expr){
    if(expr.text=='true' ||expr.text=='!false' ){
      self.display.alwaysTrue(expr);
    }
  },
  compareTrees: function compareTrees(root1,root2){
    if(self.display.errorNodesStack.includes(root1.text)
    || self.display.errorNodesStack.includes(root2.text)){
      return;
    }
    let nodes1=self.treeBuilder.bfs(root1).filter(o=>o.content.type=='expression');
    let nodes2=self.treeBuilder.bfs(root2).filter(o=>o.content.type=='expression');
    let result=true;
    if(nodes1.length===nodes2.length){
      nodes1.forEach((item, i) => {
        if(item.content.text!==nodes2[i].content.text){
          result=false;
          return;
        }
      });

    }else{
      result=false;
    }
    if(result){
      self.display.duplicitIteBranches(root1);
    }
      //return result;
  }

}
