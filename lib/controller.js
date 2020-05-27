let self = module.exports = {
    parsing: parsing = require('./parsing'),
    check: check = require('./check'),
    treeOps: treeOps =require('./tree-operations'),
    typecheck: typecheck = require('./type-check'),
    treeBuilder: treeBuilder = require('./tree-builder'),
    DerivationTreeView: DerivationTreeView= require('./DerivationTreeView'),
    /**
     * The main controller function. Starting point of the static analysis workflow.
     * @param data - string containing source file contents
     */
    main: function main(data) {
        let tree = self.parsing.parsingAction(data); //get AST
        self.clearPanel();
        if (self.parsing.syntaxCheck(tree)) { //syntax errors
            self.check.unusedFunctions = [];
            self.typecheck.perform(tree.rootNode.child(0)); //typechecking
            self.check.unusedFunction(typecheck.typeEnv);  //check for unused functions when all functions are type checked
            self.check.duplicitCode(); //compare functions in the source file to find redundant code
            self.buildTree(); //tree view in the left panel
        }
    },
    /**
     * Every time the file is saved, the panel should be destroyed.
     */
    clearPanel: function () {
        let item = atom.workspace.getLeftDock().getPaneItems().find(i => i.constructor.name === 'DerivationTreeView');
        let found = atom.workspace.getLeftDock().paneForItem(item);
        if (found != null) {
            found.destroy();
        }
    },
    /**
     * Creates new DerivationTreeView object and updates
     * its content so that the tree structures can be displayed.
     */
    buildTree: function buildTree() {
        let model = new DerivationTreeView();
        atom.views.addViewProvider(DerivationTreeView);
        self.clearPanel();
        atom.workspace.open(model);
        let content = self.treeBuilder.buildHTML();
        model.update(content);
        self.treeBuilder.result = [];
        self.treeBuilder.forest = [];
    }
};
