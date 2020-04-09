let self = module.exports = {
  display: display = require('./display'),
  unusedFunctions: unusedFunctions = [],
  functionName: function functionName(node) {
    const regex = /^([a-z]+[A-Z]?)*$/g;
    return regex.test(node.text);
  },
  unusedFunction: function unusedFunction(typeEnv) {
    typeEnv.forEach(fun => {
      if (self.unusedFunctions.some(f => fun.name == f)) {
        self.display.unusedFunction(fun.name);
      }
    });
  },
  unusedArg: function unusedArg(arg_list, body, def) {
    let args = [];
    self.getAllLeafs(arg_list, args);
    let leafs = [];
    self.getAllLeafs(body, leafs);
    args.forEach(arg => {
      if(leafs.some(i => i == arg) == false){
        self.display.unusedArg(def, arg, body);
        console.log('unused arg: ' + arg);
      }
    });
  },
  getAllLeafs: function getAllLeafs(node, leafs) {
    for (let i = 0; i < node.namedChildren.length; i++) {
      if (node.namedChildren[i].childCount == 0) {
        leafs.push(node.namedChildren[i].text);
      }
      self.getAllLeafs(node.namedChildren[i], leafs);
    }
  }
}
