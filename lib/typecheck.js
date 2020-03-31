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
    var node = toResolve.firstChild;
    var childNode = node.firstChild;
    if(toResolve.type=='expression'){
      if(node.type=='const'){
        if(childNode.type=='num_const'){
          return 'int';
        }
        else if(childNode.type=='bool_const'){
          return 'bool';
        }
        else if(childNode.type=='string_const'){
          return 'string';
        }
      }
      else if(node.type=='arg'){
        // TODO: toto treba normalne spravit a aj pre vnorene volanie
        if(app.parent.type=='statement'){
          display.error('Undefined function argument used in \''+app.text+'\'');
        }
        else{
          // TODO:
        }
      }
      // TODO: message builder or sth like that
      else if(node.type=='binary_expression'){
        if( self.isArithmeticNode(childNode.type) ){
          childNode.namedChildren.forEach( n =>{
              if(n.firstChild.type != 'binary_expression'){
                var nType = self.determineType(n);
                console.log(n.firstChild.type+' : '+nType);
                if( nType.toString() !== 'int'){
                  var details= '\''+childNode.type+'\'';
                  details = details +' cannot be applied to type \''
                  details = details + nType.toString()+'\'';
                  display.error('Type error in : ' + node.text,details);
                  //return;
                }
              }
              self.determineType(n)
          });
          return 'int';
        }


      }
      else if(node.type=='unary_expression'){
        // TODO: pridat do gramatika pravidlo pre neg a -x
        console.log('unary');
      }
      else if(node.type=='function_application'){
        var funName = node.child(1).text;
        var found = self.typeEnv.find(f => f.name == funName);
        var foundRetType = found.ret_type.firstChild.text;
        if(found != null){
          return foundRetType ;
        }
      }

    }



  },
  isArithmeticNode: function isArithmeticNode(nodeType) {
      if(nodeType =='add'  || nodeType =='mul' || nodeType=='sub' || nodeType =='div' || nodeType=='mod'){
        return true;
      }
      return false;
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
