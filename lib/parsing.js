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

    //console.log(tree.rootNode.toString());
    if (statSeq == null || statSeq.firstChild == null) {
      display.error('Encountered syntax error.');
      return;
    }
    if (statSeq.firstChild.type == 'err_word') {
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
      const check = require('./check');
      check.unusedFunctions = [];
      typecheck.perform(statSeq);
      check.unusedFunction(typecheck.typeEnv);
      check.duplicitCode();
      //let pane =atom.workspace.getActivePane().splitDown();
      let myModel = new myView();
      atom.views.addViewProvider(myView);
      if(atom.workspace.getLeftPanels()!=null){
          atom.workspace.getLeftPanels().forEach((item, i) => {
            item.destroy();
          });

        }
      atom.workspace.addLeftPanel({item: myModel})
      //pane.addItem(myModel);
     //pane.activate();
     //pane.activateItem(item);
     let content="";//"use x( 7, use y(5))<br>";
      /*typecheck.trees.reverse().forEach((item, i) => {
        content=content+item+"<br>";
      });*/
      //content=content+"<span>hallo</span><span> flieger</span>"

    /*  Object.keys(typecheck.trees).reverse().forEach(function(key) {
        content =content+typecheck.trees[key]+'<br>______</br>'+key+'<br><br>*******<br></br>';
        //content=content+'_____________<br>'+typecheck.trees[key]+'_____________<br>'+key;
      });*/
      myModel.update(typecheck.final);

      //let data="frixhfurhnocrhgufhrguhrughxrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrre3xo furhfdeushwushwshwoudzhewuhdzewhdzuehzduze2hudheduheudheudheudheudheudheuhddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"

      //atom.workspace.addBottomPanel({item: myModel});
      /*let pane = atom.workspace.getActivePane().splitDown();
      let fileEditor = atom.workspace.buildTextEditor();
      let item = pane.addItem(fileEditor);
      pane.activateItem(item);
      fileEditor.setText(content);*/
    }

    //console.log(fun);
  }



};
class myView{
  constructor(){
      this.element=document.createElement('div');
      //this.element.innerHTML ='<div style="padding: 5em">'+data+'</div>';
  //    this.element.collapse = this.collapse.bind(this)
  }
  getTitle() {
    // Used by Atom for tab text
    return 'Tree view';
  }

  update(data){
    this.element.innerHTML ='<div style="overflow: auto;max-height: 100%; font-size:large;"><p style="padding: 2em;">'+data+'</p><div>';
  }
}
