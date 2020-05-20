let self = module.exports = {
    parsing: parsing = require('./parsing'),
    check: check = require('./check'),
    treeOps: treeOps =require('./tree-operations'),
    typecheck: typecheck = require('./type-check'),
    treeBuilder: treeBuilder = require('./tree-builder'),
    DerivationTreeView: DerivationTreeView= require('./DerivationTreeView'),
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
    clearPanel: function () {
        let item = atom.workspace.getLeftDock().getPaneItems().find(i => i.constructor.name === 'DerivationTreeView');
        let found = atom.workspace.getLeftDock().paneForItem(item);
        if (found != null) {
            found.destroy();
        }
    },
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