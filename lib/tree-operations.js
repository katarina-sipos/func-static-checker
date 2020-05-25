let self = module.exports = {
    /**
     * Populates given array with leaf nodes objects from a given tree.
     * @param node - root node of the tree.
     * @param leafNodes - array to be populated with the leaf nodes
     */
    getAllLeafNodes: function (node, leafNodes) {
        if (node == null) {
            leafNodes = [];
            return;
        }
        for (let i = 0; i < node.namedChildren.length; i++) {
            if (node.namedChildren[i].namedChildren.length === 0) {
                leafNodes.push(node.namedChildren[i]);
            }
            self.getAllLeafNodes(node.namedChildren[i], leafNodes);
        }
    },
    /**
     * DFS algorithm used to get all the nodes objects from a given tree.
     * @param root - root of the tree we want to get nodes
     * @param arr - array to be populated with the nodes objects
     */
    getAllNodes: function (root, arr) {
        for (let i = 0; i < root.namedChildren.length; i++) {
            arr.push(root.namedChildren[i]);
            self.getAllNodes(root.namedChildren[i], arr);
        }
    },
    /**
     * BFS algorithm (level order) to
     * populate an array with objects containing node and ist level in the tree.
     * @param root - root of a tree to be iterated in level-order
     * @returns {[]} - array of the {content:node,level:levelNumber} objects
     */
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
