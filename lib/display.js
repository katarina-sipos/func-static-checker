let self = module.exports = {
  marker: marker = null,
  elms: elms = [],
  disposable: disposable = null,
  error: function error(message, msg_details, node) {

    if (node != null) {
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
      class: 'errorC'
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
  wrongNumOfArgs: function wrongNumOfArgs(node) {
    self.error('Wrong number of arguments in \'' + node.text + '\'.', "", node);
    self.highlightError(node);
  },
  wrongArgTypes: function wrongArgTypes(expected, found, node) {
    let details = 'Expected types of agruments: \'' + expected.text + '\'. ';
    details = details + 'Found: ' + found;
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
    let details = '\'' + operation + '\'';
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
    self.warning('Unused arg: \'' + arg + '\' in \'' + def.text + '\'', "", body);
    self.highlightWarn(body);
  },
  unusedFunction: function unusedFunction(name) {
    self.warning('Function \'' + name + '\' defined but not used.');
  },
  warning: function basicWarning(message, details, node) {
    if (node != null) {
      let line = atom.workspace.getActiveTextEditor().bufferPositionForScreenPosition([node.startPosition.row, node.startPosition.row]);
      line = line.row + 1;
      message = 'Line ' + line + ': ' + message;

    }
    atom.notifications.addWarning(message, {
      detail: details,
      dismissable: true
    });
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
