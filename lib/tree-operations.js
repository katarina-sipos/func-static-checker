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
    },
    bfs: function (root) {
        let visited = [];
        let queue = [];
        let current = {content:root,level:0};
        queue.push(current);
        while (queue.length) {
            current = queue.shift();
            visited.push(current);
            current.content.namedChildren.forEach((item, i) => {
                queue.push({content:item,level:current.level+1});
            });
        }
        return visited;
    }




};
