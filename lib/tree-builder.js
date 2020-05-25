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
  /**
   * Finds out the node type to be displayed in the type derivation tree
   * and returns the type rule to be used accordingly.
   * @param item - node of the statement in the type derivation tree
   * @returns {string} - string containing displayed type rule in the tree.
   */
  getTypeRule: function (item) {
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
  /**
   * Sorts the array according the node level in the object
   * so that the objects are in the order by their parents in the tree.
   * @param toSort - array to be sorted
   */
  sortByLevel: function (toSort){
    return toSort.sort((a, b) => (a.level !== b.level) ? 1 : -1);
  },
  /**
   * Populates the tree with the statement and its derivation.
   * @param node - root node of the type tree.
   */
  populate: function (node) {
    let toVisit=self.treeOps.bfs(node);
    toVisit=toVisit.filter(o=>o.content.type==='expression');
    let tree = "";
    toVisit = self.sortByLevel(toVisit);
    toVisit.forEach((item, i) => {
      let type = self.getTypeRule(item);
      tree = tree + " " + self.wrap(item.content.text) + self.annotateType(type);
      if (i < toVisit.length - 1) {
        if(item.level!==toVisit[i + 1].level){
          console.log("populare tree: "+ tree);
          self.result.push(tree);
          tree = "";
        }
      }
    });
    self.result.push(tree);
  },
  /**
   * Iterates over all the function inputs and
   * creates tree of all the intro expressions.
   * Each individual tree is the pushed to the forest array.
   * Forest array is stored in the cluster with all the trees to be displayed.
   * @param node - function input root node
   * @param app - fucntion application statement node
   */
  buildTree: function (node, app) {
    self.result = [];
    self.forest = [];
    if (node != null) {
      node.namedChildren.forEach((item, i) => {
        self.populate(item);
        console.log("buildTree result: "+self.result);
        self.forest.push(self.result);
        self.result = [];
      });
      self.forest.push(self.wrap(app.text) + self.annotateType('APP'));
      self.cluster.push(self.forest);
    }
  },
  /**
   * Iterates over cluster that contains HTML elements with expressions annotated with type rules.
   * It joins the
   * @returns {string} - HTML string with all the trees to be displayed.
   */
  buildHTML: function () {
    let content = "";
    content = '<span>';
    self.cluster.forEach(typeTree => {
      let last = typeTree.pop();
      typeTree.forEach(item => {
        console.log("buildHTML item: "+item);
        content = content + '<span class="item-inline">' + item.join('<br>') + '</span>&ensp;';
      });
      content = content + '<br>' + last + '<br><br></span>';
    });
    self.cluster = [];
    self.result = [];
    self.forest = [];
    return content;
  }
};
