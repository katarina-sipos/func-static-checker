let self = module.exports = {
  result: result = [],
  forest: forest = [],
  cluster: cluster = [],
  display: display = require('./display'),
  treeOps: treeOps= require('./tree-operations'),
  init: function () {
    self.typeEnv = [];
    require('./type-check').predefineIte();
    self.trees = [];
    self.cluster = [];
  },
  wrap: function (content) {
    if (self.display.errorNodesStack.includes(content)) {
      return '<span class="errorNode">' + content + '</span>';
    }
    return '<span class="node">' + content + '</span>';
  },
  getType: function (item) {
    if(self.display.errorNodesStack.includes(item.content.text)){
      return '?';
    }
    let type = "";
    if (item.content.firstNamedChild.type === 'binary_expression' || item.content.firstNamedChild.type === 'unary_expression') {
      type = item.content.firstNamedChild.firstNamedChild.type.toUpperCase();
    } else if (item.content.firstNamedChild.type === 'function_application') {
      type = 'APP';
    } else {
      type = 'A';
    }
    return type;
  },
  annotateType: function (type) {
    return '<sup class="type-annotation"> ' + type + '</sup>';
  },
  sortByLevel: function (toSort){
    return toSort.sort((a, b) => (a.level !== b.level) ? 1 : -1);
  },
  populate: function (node) {
    let toVisit=self.treeOps.bfs(node);
    toVisit=toVisit.filter(o=>o.content.type==='expression');
    let tree = "";
    toVisit = self.sortByLevel(toVisit);
    toVisit.forEach((item, i) => {
      let type = self.getType(item);
      tree = tree + " " + self.wrap(item.content.text) + self.annotateType(type);
      if (i < toVisit.length - 1) {
        if(item.level!==toVisit[i + 1].level){
          self.result.push(tree);
          tree = "";
        }
      }
    });
    self.result.push(tree);
  },
  getNodes: function (node, app) {
    self.result = [];
    self.forest = [];
    if (node != null) {
      node.namedChildren.forEach((item, i) => {
        self.populate(item);
        self.forest.push(self.result);
        self.result = [];
      });
      self.forest.push(self.wrap(app.text) + self.annotateType('APP'));
      self.cluster.push(self.forest);
    }
  },
  buildHTML: function () {
    let content = "";
    content = '<span>';
    self.cluster.forEach(typeTree => {
      let last = typeTree.pop();
      typeTree.forEach(item => {
        content = content + '<span class="item-inline">' + item.join('<br>') + '</span>&ensp;';
      });
      content = content + '<br>' + last + '<br><br></span>';
    });
    self.cluster = [];
    self.result = [];
    self.forest = [];
    return content;
  }
  /*bfs: function (root) {
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
  }*/
};
