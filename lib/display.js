let self = module.exports = {
    marker: marker = null,
    elms: elms = [],
    disposable: disposable = null,
    errorNodesStack: errorNodesStack=[],
    ops: ops = {
        'str_cat': '++',
        'add': '+',
        'sub': '-',
        'div': '/',
        'mul': '*',
        'mod': '%',
        'or': '||',
        'and': '&&',
        'not': '!',
        'neg': '-',
        'less': '<',
        'grt': '>',
        'eql': '==',
        'neql': '!=',
        'leql': '<=',
        'geql': '>='
    },
    error: function error(message, msg_details, node) {

        if (node != null) {
            self.errorNodesStack.push(node.text);
            let line = atom.workspace.getActiveTextEditor().bufferPositionForScreenPosition([node.startPosition.row, node.startPosition.row]);
            line = line.row + 1;
            message = 'Line ' + line + ': ' + message;

        }
        atom.notifications.addError(message, {
            detail: msg_details,
            dismissable: true,
            icon: 'alert'
        });
    },
    getOp: function getOp(operation) {
        return self.ops[operation];
    },
    duplicitArg: function duplicitArg(node) {
        self.error('Duplicit arguments defined.', '', node);
        self.highlightError(node);
    },
    duplicitDeclaration: function duplicitFunc(node) {
        self.error('Function \'' + node.text + '\' already declared.', "", node);
        self.highlightError(node);
    },
    info: function info(message, msg_details) {
        atom.notifications.addInfo(message, {
            detail: msg_details,
            dismissable: true,
            icon: 'alert'
        });
    },
    notDeclared: function notDeclared(node) {
        self.error('Function \'' + node.text + '\' is not declared.', "", node);
        self.highlightError(node);
    },
    notDefined: function notDefined(node) {
        self.error('Function \'' + node.text + '\' is not defined.', "", node);
        self.highlightError(node);
    },
    highlightError: function highlightError(node) {
        self.marker = atom.workspace.getActiveTextEditor().markBufferRange([
            [node.startPosition.row, node.startPosition.column],
            [node.endPosition.row, node.endPosition.columns]
        ]);
        atom.workspace.getActiveTextEditor().decorateMarker(self.marker, {
            type: 'line',
            class: 'my-error'
        });
    },
    highlightWarn: function highlightWarn(node) {
        self.marker = atom.workspace.getActiveTextEditor().markBufferRange([
            [node.startPosition.row, node.startPosition.column],
            [node.endPosition.row, node.endPosition.columns]
        ]);
        atom.workspace.getActiveTextEditor().decorateMarker(self.marker, {
            type: 'line-number',
            class: 'my-warning'
        });
    },
    emptyIteCall: function emptyIteCall(node){
      self.error('Error.','Empty ite call.',node);
      self.highlightError(node);
    },
    wrongNumOfArgs: function wrongNumOfArgs(node) {
        self.error('Wrong number of arguments in \'' + node.text + '\'.', "", node);
        self.highlightError(node);
    },
    comparisonMismatch: function comparisonMismatch(node){
      self.error('Cannot compare different types in \''+node.text+'\'.',"",node);
      self.highlightError(node);
    },
    wrongArgTypes: function wrongArgTypes(expected, found, node) {
        let details = 'Expected types of arguments: \'' + expected.text + '\'. ';
        details = details + 'Found: \'' + found+'\'.';
        self.error('Type error in \'' + node.text + '\'', details, node);
        self.highlightError(node);

    },
    getMarker: function getMarker() {
        return self.marker;
    },
    wrongReturnType: function wrongReturnType(node, expected, found, statement) {
        let details = 'Expected return type for \'' + node.text + '\' is ' + expected.text;
        details = details + '. Defined body might result in \'' + found + '\'.';
        self.error('Type error in \'' + statement.text + '\'.', details, node);
        self.highlightError(node);
    },
    undefinedArgError: function undefinedArgError(node) {
        self.error('Undefined function argument used in \'' + node.text + '\'', "", node);
        self.highlightError(node);
    },
    illegalOperationError: function illegalOperationError(node, operation, type) {
        let details = '\'' + self.getOp(operation) + '\'';
        details = details + ' cannot be applied to type \''
        details = details + type + '\'';
        self.error('Type error in  ' + node.text, details, node);
    },
    staticCheckWarning: function staticCheckWarning(node) {
        let line = atom.workspace.getActiveTextEditor().bufferPositionForScreenPosition([node.startPosition.row, node.startPosition.row]);
        line = line.row + 1;
        atom.notifications.addWarning('Watch out for coding conventions.', {
            detail: 'Line ' + line + ': ' + '\'' + node.text + '\'' + ' does not follow the camelCase notation.',
            dismissable: true,
            icon: 'alert'
        });
        self.highlightWarn(node);
    },
    unusedArg: function unusedArg(def, arg, body) {
        self.warning('Unused argument: \'' + arg + '\' in \'' + def.text + '\'', "", body);
        self.highlightWarn(body);
    },
    unusedFunction: function unusedFunction(name) {
        self.warning('Function \'' + name + '\' defined but not used.');
    },
    warning: function basicWarning(message, details, node) {
        if (node != null) {
            if(atom.workspace.getActiveTextEditor()==null) return;
            let line = atom.workspace.getActiveTextEditor().bufferPositionForScreenPosition([node.startPosition.row, node.startPosition.row]);
            line = line.row + 1;
            message = 'Line ' + line + ': ' + message;

        }
        atom.notifications.addWarning(message, {
            detail: details,
            dismissable: true
        });
    },
    duplicitCode: function duplicitCode(node1, node2) {
        self.warning('Duplicit code.', 'Function \'' + node1.name + '\' might have the same effect as function \'' + node2.name + '\'.', node1.body);
        self.highlightWarn(node1.body);
    },
    conditionNotBool: function conditionNotBool(node,type){
      self.error('Type error in ite.',
      'First argument of if-then-else must be of type \'bool\'. Found: \''+ type+'\'',node);
      self.highlightError(node);
      return;
    },
    branchesTypesMismatch: function branchesTypesMismatch(type1,type2,node){
      self.error('Type error in ite.',
      'Branches of ite must be of the same type. Found: \''+ type1+'\' and \''+ type2+'\'',node);
      self.highlightError(node);
    },
    duplicitIteBranches: function duplicitIteBranches(node){
      self.warning('Useless ite call.',
      'Both branches of ite have the same effect. Redesign branches or remove ite call.',node);
      self.highlightWarn(node);
    },
    alwaysTrue: function alwaysTrue(node){
      self.warning('Useless ite call.',
      'Given condition always evaluates to true. Redesign condition or remove ite call.',node);
      self.highlightWarn(node);
    },
    recursiveCall: function recursiveCall(caller,func){
      self.warning('Recursive function call.','Recursive call of \''+func+'\' in '+caller.text,caller);
      self.highlightWarn(caller);
    }
};
/*
__________
5
___________
use y(5)   5
___________
use x (use y(5),5)

*/
