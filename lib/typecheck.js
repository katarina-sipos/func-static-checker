var self = module.exports = {
  typeEnv: typeEnv = [],
  kids: toResolveKids = [],
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
          self.define(arr, node.firstChild);
        } else if (node.firstChild.type == 'function_application') {
          arr = node.firstChild.namedChildren;
          self.use(arr, node.firstChild);
        }
      }
    }
  },
  declare: function declare(arr) {
    const display = require('./display');
    var fName = arr[0].text;
    var func;
    const found = self.typeEnv.some(fun => fun.name == fName);
    if (found) {
      display.error('Function \'' + fName + '\' already defined.');
      return;
    }
    func = new Function_stat(fName, arr[2], arr[1], '', '');
    self.typeEnv.push(func);
  },
  define: function define(arr, info) {
    const display = require('./display');
    var fName = arr[0].text;
    const found = self.typeEnv.find(fun => fun.name == fName);
    if (found == null) {
      display.error('Function \'' + fName + '\' is not declared.');
      return;
    }
    found.arg_list = arr[1];
    found.body = arr[2];
    var numOfDefinedArgs = arr[1].namedChildren.length;
    var numOfDeclaredTypes = found.arg_types.namedChildren.length;
    if (numOfDefinedArgs != numOfDeclaredTypes) {
      display.error('Wrong number of arguments in \'' + info.text + '\'.');
      return;
    }
    var tp;
    found.body.namedChildren.forEach(kiddo => {
      tp = self.determineType(kiddo, info);
      if (tp != found.ret_type.firstChild.text) {
        var details = 'Expected return type for \'' + fName + '\' is ' + found.ret_type.firstChild.text;
        details = details + '. Defined body might result in \'' + tp + '\'.';
        display.error('Type error in \'' + info.text + '\'.', details);
        return;
      }
    });
  },
  use: function use(arr, app) {
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
    if (found.arg_list == null) {
      return;
    }
    var numOfUsedArgs;
    if (app.namedChildren[1] == null) {
      numOfUsedArgs = 0;
    } else {
      numOfUsedArgs = app.namedChildren[1].namedChildren.length;
    }
    if (found.arg_list.namedChildren.length != numOfUsedArgs || found.arg_types.namedChildren.length != numOfUsedArgs) { // arr[1].namedChildren.length){
      display.error('Wrong number of arguments in \'' + app.text + '\'.');
      return;
    }
    var type;
    for (var i = 0; i < arr[1].namedChildren.length; i++) {
      type = self.determineType(arr[1].namedChildren[i], app);
      if (found.arg_types.namedChildren[i].text != type) {
        var details = 'Expected types or agruments: \'' + found.arg_types.text + '\'. ';
        details = details + 'Found: ' + type;
        display.error('Type error in \'' + app.text + '\'', details);

        return;
      }
    }
  },
  determineType: function determineType(toResolve, app) {
    const display = require('./display');
    var node = toResolve.firstChild;
    var childNode = node.firstChild;
    if (toResolve.type == 'expression') {
      if (node.type == 'const') {
        if (childNode.type == 'num_const') {
          return 'int';
        } else if (childNode.type == 'bool_const') {
          return 'bool';
        } else if (childNode.type == 'string_const') {
          return 'string';
        } else {
          return 'undefined type';
        }
      } else if (node.type == 'arg') {
        var found = self.typeEnv.find(f => f.name == app.child(1).text);
        var arr = found.arg_list.text.split(',');
        var foundArg = arr.find(a => a == node.text);
        var index = arr.findIndex(a => a == foundArg);
        if (found == null || foundArg == null) {
          display.error('Undefined function argument used in \'' + app.text + '\'');
          return 'undefined type';
        } else {
          arr = found.arg_types.text.split(',');
          return arr[index];
        }
      } else if (node.type == 'binary_expression' || node.type == 'unary_expression') {
        var toReturn;
        var expected;
        if (self.isArithmeticNode(childNode.type)) {
          toReturn = 'int';
          expected = 'int'
        } else if (self.isStringNode(childNode.type)) {
          toReturn = 'string';
          expected = 'string';
        } else if (self.isBoolNode(childNode.type)) {
          toReturn = 'bool';
          expected = 'bool';
        } else {
          return 'undefined type';
        }
        childNode.namedChildren.forEach(n => {
          var nType = self.determineType(n, app);
          if (nType.toString() !== expected) {
            var details = '\'' + childNode.type + '\'';
            details = details + ' cannot be applied to type \''
            details = details + nType.toString() + '\'';
            display.error('Type error in : ' + node.text, details);
            toReturn = 'undefined type';
            return toReturn;
          }
          self.determineType(n, app)
        });
        return toReturn;
      } else if (node.type == 'function_application') {
        var funName = node.child(1).text;
        var found = self.typeEnv.find(f => f.name == funName);
        var foundRetType = found.ret_type.firstChild.text;
        if (found != null) {
          return foundRetType;
        }
      } else {
        return 'undefined type';
      }
    }
  },
  isArithmeticNode: function isArithmeticNode(nodeType) {
    if (nodeType == 'add' || nodeType == 'mul' || nodeType == 'sub' || nodeType == 'div' || nodeType == 'mod' || nodeType == 'neg') {
      return true;
    }
    return false;
  },
  isStringNode: function isStringNode(nodeType) {
    if (nodeType == 'str_cat') {
      return true;
    }
    return false;
  },
  isBoolNode: function isBoolNode(nodeType) {
    if (nodeType == 'and' || nodeType == 'or' || nodeType == 'not') {
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
