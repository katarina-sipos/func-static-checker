let self=module.exports = {
    result: result = [],
    forest: forest=[],
    cluster: cluster=[],
    init: function init(){
        self.typeEnv = [];
        self.trees = [];
        self.cluster=[];
    },
    wrap: function wrap(content){
        return '<span style="text-decoration:overline">'+content+'</span>';
    },
    getType: function getType(item){
        let type="";
        if (item.firstNamedChild.type === 'binary_expression') {
            type = item.firstNamedChild.firstNamedChild.type.toUpperCase();
        } else if (item.firstNamedChild.type === 'function_application') {
            type = 'APP';
        } else {
            type = 'A';
        }
        return type;
    },
    sortByParent: function sortByParent(toSort){
        return toSort.sort((a, b) => ((a.parent.text !== b.parent.text) || (a.parent.type !== b.parent.type)) ? 1 : -1);
    },
    expressionChildren: function expressionChildren(node){
        return node.descendantsOfType('expression', node.startPosition, node.endPosition);
    },
    populate: function populate(node) {
        let toVisit = self.expressionChildren(node);//= node.descendantsOfType('expression', node.startPosition, node.endPosition);
        tree = "";
        toVisit=self.sortByParent(toVisit);
        //toVisit = toVisit.sort((a, b) => ((a.parent.text !== b.parent.text) || (a.parent.type !== b.parent.type)) ? 1 : -1);
        toVisit.forEach((item, i) => {
            let type = self.getType(item);
            tree = tree + " " + self.wrap(item.text) + '<sup style="color:#ad221d"> ' + type+'</sup>';
            if (i < toVisit.length - 1){
                if ((item.parent.text !== toVisit[i + 1].parent.text) || (item.parent.type !== toVisit[i + 1].parent.type)) {
                    self.result.push(tree);
                    tree = "";
                }
            }
        });
        self.result.push(tree);
    },
    getNodes: function getNodes(node,parent) {
        self.result=[];
        self.forest=[];
        if(node!=null){
            node.namedChildren.forEach((item, i) => {
                self.populate(item);
                self.forest.push(self.result);
                self.result=[];
            });
            self.forest.push(self.wrap(parent.text) + '<sup style="color:#ad221d">APP</sup>');
            self.cluster.push(self.forest);
        }
    },
    buildHTML: function buildHTML() {
        let content="";
        content='<span>';
        self.cluster.forEach(typeTree => {
            let last=typeTree.pop();
            typeTree.forEach(item => {
                content=content+'<span style="display:inline-block">'+item.join('<br>')+'</span>&ensp;';
            });
            content=content+'<br>'+last+'<br><br></span>';
        });
        self.cluster=[];
        self.result=[];
        self.forest=[];
        return content;
    }


};
