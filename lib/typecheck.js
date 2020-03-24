 var self = module.exports = {
   typeEnv: typeEnv = [],
   perform: function perform(statSeq) {
     self.typeEnv = [];
     var num = statSeq.childCount;
     for (var i = 0; i < num; i++) {
       node = statSeq.child(i);
       if (node.constructor.name == 'StatementNode' && node.type == 'statement') {
         if (node.firstChild.type == 'function_declaration') {
           //console.log(node.firstChild.namedChildren);
           arr = node.firstChild.namedChildren;
           self.declare(arr);
         } else if (node.firstChild.type == 'function_definition') {
           arr = node.firstChild.namedChildren;
           self.define(arr);
         } else if (node.firstChild.type == 'function_application') {
           arr = node.firstChild.namedChildren;
           self.use(arr);
         }
       }
     }
     //console.log(arr);
     //console.log(JSON.stringify(typeEnv,null,2));
     //console.log(typeEnv.length);
   },
   declare: function declare(arr) {
     const display = require('./display');
     var fName = arr[0].text;
     //console.log(fName);
     var func;
     const found = self.typeEnv.some(fun => fun.name == fName);
     if (found) {
       display.error('Function \'' + fName + '\' already defined.');
       return;
     }
     func = new Function_stat(fName, arr[2], arr[1], '', '', '');
     self.typeEnv.push(func);
   },
   define: function define(arr) {
     const display = require('./display');
     var fName = arr[0].text;
     const found = self.typeEnv.find(fun => fun.name == fName);
     //console.log(found);
     if (found == null) {
       display.error('Function \'' + fName + '\' is not declared.');
       return;
     }
     found.arg_list = arr[1];
     found.body = arr[2];
     //console.log(arr.toString());
   },
   use: function use(arr) {
     const display = require('./display');
     var fName = arr[0].text;
     var found = self.typeEnv.find(fun => fun.name == fName);
     if (found == null) {
       display.error('Function \'' + fName + '\' is not defined.');
       return;
     }
     //found = self.typeEnv.find(fun => fun.name == fName && fun.body==='');
     if (found.body == '') {
       display.error('Function \'' + fName + '\' not defined.');
       return;
     }
     //found = self.typeEnv.find(fun => fun.name == fName);
     found.usage = arr[1];
   }
 };
 class Function_stat {
   constructor(name, ret_type, arg_types, arg_list, body, usage) {
     this.name = name;
     this.ret_type = ret_type;
     this.arg_types = arg_types;
     this.arg_list = arg_list;
     this.body = body;
     this.usage = usage;
   }
 }
 /*for(var i=0;i<statSeq.childCount;i++){
   //  if(statSeq.child(i).isNamed==false) continue;
   node = statSeq.child(i);

     if(node.constructor.name =='StatementNode' && node.type == 'statement' ){
       //if(node.firstChild.type == 'function_declaration'){
         //console.log(node.firstChild.namedChildren);
         arr=node.firstChild.namedChildren;
       //}


     }*/
 /*switch(node.firstChild.type){
     case 'function_declaration': declarationStack.push(node.firstChild.text); break;
     case 'function_definition': definitionStack.push(node.firstChild); break;
     case 'function_application': useStack.push(node.firstChild); break;
     default: break;
 }
 statementsStack.push(node.firstChild);*/
 /*if(node.firstChild.type == 'function_declaration'){
            //fun.push(node.firstChild.child(1).text);
            console.log(node.firstChild.text);
            fun.name=node.firstChild.child(1).text;
            fun.argType=node.firstChild.child(3).text+' , '+node.firstChild.child(4).text;
;
            //if(fun.argType==')') fun.argType='void'
            fun.retType=node.firstChild.child(6).text;

            //fun[node.firstChild.child(1).type]=node.firstChild.child(0).first;
        }*/

 //  }
 /*console.log(arr.length);
 arr.forEach(item => console.log(item.toString()));*/
