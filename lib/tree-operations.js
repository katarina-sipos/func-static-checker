let self = module.exports = {
    getAllLeafNodes: function (node, leaves) {
        if (node == null) {
            leaves = [];
            return;
        }
        for (let i = 0; i < node.namedChildren.length; i++) {
            if (node.namedChildren[i].namedChildren.length === 0) {
                leaves.push(node.namedChildren[i]);
            }
            self.getAllLeafNodes(node.namedChildren[i], leaves);
        }
    },
    getAllNodes: function (root, arr) {
        for (let i = 0; i < root.namedChildren.length; i++) {
            arr.push(root.namedChildren[i]);
            self.getAllNodes(root.namedChildren[i], arr);
        }
    }




};
