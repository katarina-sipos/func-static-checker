var self = module.exports = {
  parsingAction: function parsingAction(data) {
    const Parser = require('tree-sitter');
    const Func = require('tree-sitter-func');
    const parser = new Parser();
    parser.setLanguage(Func);
    const display = require('./display');
    var sourceCode = data.toString();
    const tree = parser.parse(sourceCode);
    if (tree.rootNode == null) {
      display.error('Encountered syntax error.');
      return;
    }
    var statSeq = tree.rootNode.child(0); //sequence of statements in source file
    var t = tree.rootNode;
    var arr = [];
    var node;

    if (statSeq == null || statSeq.firstChild == null) {
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
      const treeBuilder=require('./treeBuilder');
      const check = require('./check');
      check.unusedFunctions = [];
      typecheck.perform(statSeq);
      check.unusedFunction(typecheck.typeEnv);
      check.duplicitCode();
      let myModel = new myView();
      atom.views.addViewProvider(myView);
      let item = atom.workspace.getBottomDock().getPaneItems().find(i=>i.constructor.name==='myView');

let found=atom.workspace.getBottomDock().paneForItem(item);
if(found != null){
  found.destroy();
}



     atom.workspace.open(myModel);
      let content = treeBuilder.buildHTML();
      myModel.update(content);
      treeBuilder.result=[];
      treeBuilder.forest=[];
    }

  }



};
class myView{
  constructor(){
      this.element=document.createElement('div');
  }
  getTitle() {
    // Used by Atom for tab text
    return 'Typing rules tree view';
  }

  update(data){
    this.element.innerHTML="";
    this.element.innerHTML ='<div style="padding: 2em;overflow: auto;max-height: 100%; font-size:large; ">'+data+'</div>';
  }
  //this item will be inserted in bottom dock
   getDefaultLocation(){
     return 'bottom';
   }
}
