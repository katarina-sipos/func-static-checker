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
           self.define(arr,node.firstChild);
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
   define: function define(arr,info) {
     const display = require('./display');
     var fName = arr[0].text;
     const found = self.typeEnv.find(fun => fun.name == fName);
     if (found == null) {
       display.error('Function \'' + fName + '\' is not declared.');
       return;
     }
     found.arg_list = arr[1];
     found.body = arr[2];
     //console.log(info.text);
     var tp = self.determineType(found.body.firstChild,info);
     if( tp !='undefined type' && tp !=found.ret_type.firstChild.text ){
       var details = 'Expected return type for \''+fName+'\' is '+found.ret_type.firstChild.text;
       details = details + '. Defined body might result in \''+tp+'\'.';
       display.error('Type error in \''+info.text+'\'.',details);
     }
     /*if(found.body.firstChild.type == 'expression'){
       if(found.body.firstChild.firstChild.type == 'binary_expression'){
         //var x = self.determineType(found.body.firstChild.firstChild,';;;');
         //console.log(found.body.firstChild.firstChild.firstChild.namedChildren);
         //var to=found.body.firstChild.firstChild.firstChild.type;
         //var t = self.getType(to);
         //if(t != found.ret_type.firstChild.text){
          // console.log(fName);
           //console.log(found.ret_type.firstChild.text);
           /*var details = 'Expected return type for \''+fName+'\' is '+found.ret_type.firstChild.text;
           details = details + '. Defined body might result in \''+t+'\'.';
           display.error('Type error in \''+info.text+'\'.',details);*/
        // }
            //console.log('katastrfo');

       //}
     //}
     //console.log(found.body.firstChild.type.toString());//.firstChild.firstChild.type.toString());
     /*var type;
     console.log(arr[2].namedChildren);
     for(var i=0;i<arr[2].namedChildren.length;i++){
       type=self.determineType(arr[2].namedChildren[i],fName);
       if(found.arg_types.namedChildren[i].text != type){
         display.error('Type error ');
         return;
       }
     }
     //console.log('TYYYYYP: '+found.ret_type.firstChild.text);
     if(type != found.ret_type.firstChild.text){
       var details = "Expected return type: "+ found.ret_type.firstChild.text;
       details = details + ". Found: "+ type;
       display.error('Type error',details);
     }*/
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
    // console.log(arr[1].text);
     var originalString = arr[1].text;
     const splitString = originalString.split(",");

//     console.log(splitString.length);

     if(found.arg_list.namedChildren.length!=splitString.length){// arr[1].namedChildren.length){
       //console.log(arr[1].namedChildren);
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
        else{
          return 'undefined type';
        }
      }
      else if(node.type=='arg'){
        // TODO: toto treba normalne spravit a aj pre vnorene volanie
      //  console.log(toResolve.text);
        //console.log("APP: "+app.type.toString());
        if(app.type=='function_definition'){
          //console.log(app.child(1).text);
          var found=self.typeEnv.find( f => f.name==app.child(1).text);
          //console.log(found.arg_list.text);
          var arr = found.arg_list.text.split(',');
          var foundArg = arr.find( a => a== node.text);
          var index = arr.findIndex(a => a ==foundArg);
          //console.log(index);
        //  console.log(found.arg_types.text);

          if(foundArg == null ) {
            display.error('Undefined function argument used in \''+app.text+'\'');
            return 'undefined type';
          }
          else{
            arr = found.arg_types.text.split(',');
            //console.log(arr[index]);
            //console.log('llll');

            return arr[index];
          }


          // TODO: najst taku funckiu v typeEnv a zistit, ci ten arg je v nej
        }
      /*  if(app==null ){
          display.error('Undefined function argument used in \''+app.text+'\'');
          return 'undefined type';

        }*/
      }
      // TODO: message builder or sth like that
      else if(node.type=='binary_expression'){
        //var X;
        var toReturn = 'int';
        if( self.isArithmeticNode(childNode.type) ){
          childNode.namedChildren.forEach( n =>{
              if(n.firstChild.type != 'binary_expression'){
                var nType = self.determineType(n,app);
                //console.log('im here');
                if(nType == 'undefined type') return;
                //console.log(n.firstChild.type+' : '+nType);
                if( nType.toString() !== 'int'){
                  var details= '\''+childNode.type+'\'';
                  details = details +' cannot be applied to type \''
                  details = details + nType.toString()+'\'';
                  display.error('Type error in : ' + node.text,details);
                  toReturn='undefined type';
                  //console.log("kiiiii");
                  //x='undefined type';

                }
              }
              self.determineType(n,app)
          });
          //if(x =='undefined type') return 'undefined type'
          return toReturn;
        }
        else if( self.isStringNode(childNode.type) ){
          childNode.namedChildren.forEach( n =>{
              if(n.firstChild.type != 'binary_expression'){
                var nType = self.determineType(n,app);
                if(nType == 'undefined type') return;

                //console.log(n.firstChild.type+' : '+nType);
                if( nType.toString() !== 'string'){
                  var details= '\''+childNode.type+'\'';
                  details = details +' cannot be applied to type \''
                  details = details + nType.toString()+'\'';
                  display.error('Type error in : ' + node.text,details);
                  //return 'undefined type';

                }
              }
              self.determineType(n,app)
          });
          return 'string';
        }
        else if(self.isBoolNode(childNode.type)){
          childNode.namedChildren.forEach( n =>{
              if(n.firstChild.type != 'binary_expression'){
                var nType = self.determineType(n,app);
                //console.log(n.firstChild.type+' : '+nType);
                if(nType == 'undefined type') return;

                if( nType.toString() !== 'bool'){
                  var details= '\''+childNode.type+'\'';
                  details = details +' cannot be applied to type \''
                  details = details + nType.toString()+'\'';
                  display.error('Type error in : ' + node.text,details);
                  //return 'undefined type';
                }
              }
              self.determineType(n,app);
          });
          return 'bool';
        }
        else{
          return 'undefined type';
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
      else{
        return 'undefined type';
      }

    }



  },
  isArithmeticNode: function isArithmeticNode(nodeType) {
      if(nodeType =='add'  || nodeType =='mul' || nodeType=='sub' || nodeType =='div' || nodeType=='mod'){
        return true;
      }
      return false;
  },
  isStringNode: function isStringNode(nodeType) {
      if(nodeType =='str_cat'){
        return true;
      }
      return false;
  },
  isBoolNode: function isBoolNode(nodeType) {
      if(nodeType =='and' || nodeType =='or' ){
        return true;
      }
      return false;
  },
  getType: function getType(nodeType){
    if(self.isArithmeticNode(nodeType)){
      return 'int';
    }
    else if(self.isBoolNode(nodeType)){
      return 'bool'
    }
    else if( self.isStringNode(nodeType)){
      return 'string'
    }
    else{
      return 'undefined type'
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
