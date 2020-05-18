let self = module.exports = {
    display: display = require('./display'),
    parsingAction: function (data) {
        if (data == null) return;
        const Parser = require('tree-sitter');
        const Func = require('tree-sitter-func');
        const parser = new Parser();
        parser.setLanguage(Func);
        return parser.parse(data.toString());
    },
    syntaxCheck: function (tree) {
        if (tree.rootNode == null) {
            self.display.error('Encountered syntax error.');
            return false;
        }
        const statSeq = tree.rootNode.child(0); //sequence of statements in source file
        let node;
        if (statSeq == null || statSeq.firstChild == null) {
            self.display.error('Encountered syntax error.');
            return;
        }
        const numOfChildren = statSeq.childCount;
        if (tree.rootNode.hasError()) {
            self.display.error('Encountered syntax error.');
            for (let i = 0; i < numOfChildren; i++) {
                node = statSeq.child(i);
                if (node.hasError() && node.text !== '') {
                    self.display.error('Syntax error near \'' + node.text + '\'');
                } else if (node.text === '') {
                    self.display.error('Missing \'' + node.type + '\'');
                }
            }
            return false;
        }
        return true;
    }
};
