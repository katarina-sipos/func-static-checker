 var self = module.exports = {
   typeEnv: typeEnv = [],
   kids: toResolveKids=[],
   perform: function perform(statSeq) {
     self.typeEnv = [];
     var num = statSeq.childCount;
     for (var i = 0; i < num; i++) {
       node = statSeq.child(i);
       if (node.constructor.name == 'StatementNode' && node.type == 'statement') {
         if (node.firstChild.type == 'function_declaration') {
           arr = node.firstChild.namedChildren;
           self.declare(arr);
         } else if (node.firstChild.type == 'function_definition') {
           arr = node.firstChild.namedChildren;
           self.define(arr);
         } else if (node.firstChild.type == 'function_application') {
           arr = node.firstChild.namedChildren;
           self.use(arr,node.firstChild);
         }
       }
     }
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
     func = new Function_stat(fName, arr[2], arr[1], '', '');
     self.typeEnv.push(func);
   },
   define: function define(arr) {
     const display = require('./display');
     var fName = arr[0].text;
     const found = self.typeEnv.find(fun => fun.name == fName);
     if (found == null) {
       display.error('Function \'' + fName + '\' is not declared.');
       return;
     }
     found.arg_list = arr[1];
     found.body = arr[2];
   },
   use: function use(arr,app) {
     const display = require('./display');
     var fName = arr[0].text;
     var found = self.typeEnv.find(fun => fun.name == fName);
     if (found == null) {
       display.error('Function \'' + fName + '\' is not defined.');
       return;
     }
     if (found.body == '') {
       display.error('Function \'' + fName + '\' not defined.');
       return;
     }
     if(found.arg_list == null ){
       return;
     }
     if(found.arg_list.namedChildren.length!= arr[1].namedChildren.length){
       display.error('Wrong number of arguments in \''+app.text+'\'.');
       return;
     }
    var type;
    for(var i=0;i<arr[1].namedChildren.length;i++){
      type=self.determineType(arr[1].namedChildren[i],app);
      if(found.arg_types.namedChildren[i].text != type){
        display.error('Type error in \''+app.text+'\'');
        return;
      }

    }

  },
  determineType: function determineType(toResolve,app) {
    const display = require('./display');
    if(toResolve.type=='expression'){
      if(toResolve.firstChild.type=='const'){
        if(toResolve.firstChild.firstChild.type=='num_const'){
          return 'int';
        }
        else if(toResolve.firstChild.firstChild.type=='bool_const'){
          return 'bool';
        }
        else if(toResolve.firstChild.firstChild.type=='string_const'){
          return 'string';
        }
      }
      else if(toResolve.firstChild.type=='arg'){
        // TODO: toto treba normalne spravit a aj pre vnorene volanie
        if(app.parent.type=='statement'){
          display.error('Undefined function argument used in \''+app.text+'\'');
        }
        else{
          // TODO:
        }
      }
      else if(toResolve.firstChild.type=='binary_expression'){
        if( toResolve.firstChild.firstChild.type =='add'  || toResolve.firstChild.firstChild.type =='mul' ){
          toResolve.firstChild.firstChild.namedChildren.forEach( n =>{
              if(n.firstChild.type != 'binary_expression'){
                var ty = self.determineType(n);
                console.log(n.firstChild.type+' : '+ty);
                if( ty.toString() !== 'int'){
                  var details= '\''+toResolve.firstChild.firstChild.type+'\''+' cannot be applied to type \''+ ty.toString()+'\'';
                  display.error('Type error in : ' + toResolve.firstChild.text,details);
                  return;
                }
              }
              self.determineType(n)
          });
          return 'int';
        }


      }
      else if(toResolve.firstChild.type=='unary_expression'){
        // TODO: pridat do gramatika pravidlo pre neg a -x
        console.log('unary');
      }

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
     //this.usage = usage;
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
