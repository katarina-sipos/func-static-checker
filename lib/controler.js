let self = module.exports = {
    parsing: parsing = require('./parsing'),
    check: check = require('./check'),
    typecheck: typecheck = require('./typecheck'),
    treeBuilder: treeBuilder = require('./treeBuilder'),
    main: function main(data) {
        const tree = self.parsing.parsingAction(data);
        self.clearPanel();
        if (self.parsing.syntaxCheck(tree)) {
            self.check.unusedFunctions = [];
            self.typecheck.perform(tree.rootNode.child(0));
            self.check.unusedFunction(typecheck.typeEnv);
            self.check.duplicitCode();
            self.buildTree();
        }
    },
    clearPanel: function clearPanel() {
        let item = atom.workspace.getBottomDock().getPaneItems().find(i => i.constructor.name === 'myView');
        let found = atom.workspace.getBottomDock().paneForItem(item);
        if (found != null) {
            found.destroy();
        }
    },
    buildTree: function buildTree() {
        let myModel = new myView();
        atom.views.addViewProvider(myView);
        self.clearPanel();
        atom.workspace.open(myModel);
        let content = self.treeBuilder.buildHTML();
        myModel.update(content);
        self.treeBuilder.result = [];
        self.treeBuilder.forest = [];
    }
};

class myView {
    constructor() {
        this.element = document.createElement('div');
    }

    getTitle() {
        // Used by Atom for tab text
        return 'Typing rules tree view';
    }

    update(data) {
        this.element.innerHTML = "";
        this.element.innerHTML = '<div class="type-tree-view">' + data + '</div>';
    }

    //this item will be inserted in bottom dock
    getDefaultLocation() {
        return 'bottom';
    }
}

/*

var activeWin =atom.workspace.getActiveTextEditor();
if(activeWin==null) return;
atom.workspace.getActiveTextEditor().buffer.onDidSave(() => {
  const path = require("path");
  const display = require('./display');
  let markers = atom.workspace.getActiveTextEditor().getMarkers();
  if(markers !== null){
    markers.forEach( m => m.destroy());
  }
  if(display.disposable != null){
    display.disposable.dispose();
    display.disposable=null;

  }
  if(atom.workspace.getRightPanels()!=null){
    atom.workspace.getRightPanels().forEach((item, i) => {
      item.destroy();
    });

  }
  //let myView = atom.views.getView(myModel);
  //viewProviderSubscription.dispose();
  const filePath = atom.workspace
    .getActiveTextEditor()
    .buffer.file.getPath();
  if (path.extname(filePath) === ".func") { //in case of func language file do
    const fs = require("fs");
            fs.readFile(filePath, (err, data) => {
      if (err) throw err;
      console.log("success in reading file content");
      controler.main();
      //action.parsingAction(data);
    });
  }
  var allNotifications =atom.notifications.getNotifications();
  allNotifications.forEach( notification => notification.dismiss());

});


*/
