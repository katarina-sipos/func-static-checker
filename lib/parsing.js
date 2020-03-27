var self = module.exports = {
  parsingAction: function parsingAction(data) {
    const Parser = require('tree-sitter');
    const Func = require('tree-sitter-func');
    const parser = new Parser();
    parser.setLanguage(Func);
    const display = require('./display');
    var sourceCode = data.toString();
    const tree = parser.parse(sourceCode);
    if(tree.rootNode ==null){
      display.error('Encountered syntax error.');
      return;
    }
    var statSeq = tree.rootNode.child(0); //sequence of statements in source file
    var t = tree.rootNode;
    var arr = [];
    var node;

    //console.log(tree.rootNode.toString());
    if (statSeq == null || statSeq.firstChild==null ) {
      display.error('Encountered syntax error.');
      return;
    }
    if(statSeq.firstChild.type == 'err_word'){
      display.error('Encountered syntax error.');
      return;
    }
    var numOfChildren = statSeq.childCount;
    if (tree.rootNode.hasError()) {
      display.error('Encountered syntax error.');
      for (var i = 0; i < numOfChildren; i++) {
        node = statSeq.child(i);
        if (node.hasError() && node.text != '') {
          display.error('Syntax error near \'' + node.text + '\'');
        } else if (node.text === '') {
          display.error('Missing \'' + node.type + '\'');
        }
      }
    } else {
      const typecheck = require('./typecheck');
      typecheck.perform(statSeq);
    }

    //console.log(fun);
  }
  /*var obj = nodeToObject(tree.rootNode);
  console.log(JSON.stringify(obj,null,2));
  function nodeToObject(node) {
    return {
      type: node.type,
      //rawChildCount: node.children.length,
      rawChildren: node.children.map(x => nodeToObject(x))
    };
  }*/
  /*for (let [key, value] of Object.entries(result)) {
    console.log(`${key}: ${value}`);
  }*/
  /*for (let [key, value] of Object.entries(t) ){
    console.log(`${key}: ${value}`);
  }*/
  //var node;
  //var numOfChildren = statSeq.childCount;//tree.rootNode.childCount;
  //for(var i=0;i<numOfChildren;i++){
  /*node=statSeq.child(0);
  console.log(node.type);
  var fun = node.child(0);
  console.log(fun.type);
  for(var j=0;j<fun.childCount;j++){
    console.log(fun.child(j).type);
  }*/
  //}
  //self.inside(tree.rootNode.toString());

  /*if(tree.rootNode.hasError()){
    display.error('Encountered syntax error.');
    for(var i=0;i<numOfChildren;i++){
      node = statSeq.child(i);
      if(node.hasError() && node.text!='' ){
        display.error('Syntax error near \''+node.text+'\'');
      }
      else if(node.text===''){
        display.error('Missing \''+node.type+'\'');
      }
    }
  } else{
    const typecheck = require('./typecheck');
    typecheck.hello();
  }*/

};
