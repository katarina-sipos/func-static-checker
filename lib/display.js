let self = module.exports = {
   marker: marker=null,
    error: function error(message, msg_details) {
        atom.notifications.addError(message, {detail: msg_details, dismissable: true, icon: 'alert'});
    },
    duplicitDeclaration: function duplicitFunc(node) {
      self.error('Function \'' + node.text + '\' already declared.');
      self.highlight(node);
    },
    info: function info(message, msg_details) {
        atom.notifications.addInfo(message, {detail: msg_details, dismissable: true, icon: 'alert'});
    },
    notDeclared: function notDeclared(node) {
      self.error('Function \'' + node.text + '\' is not declared.');
      self.highlight(node);

    },
    notDefined: function notDefined(node) {
      self.error('Function \'' + node.text + '\' is not defined.');
      self.highlight(node);

    },
    highlight: function hightlight(node){
      self.marker = atom.workspace.getActiveTextEditor().markBufferRange([[node.startPosition.row, node.startPosition.column], [node.endPosition.row, node.endPosition.columns]]);
      atom.workspace.getActiveTextEditor().decorateMarker(self.marker, { type: 'line', class: 'error'});
    },
    wrongNumOfArgs: function wrongNumOfArgs(node){
      self.error('Wrong number of arguments in \'' + node.text + '\'.');
      self.highlight(node);
    },
    wrongArgTypes: function wrongArgTypes(expected,found,node){
      let details = 'Expected types of agruments: \'' + expected.text+ '\'. ';
      details = details + 'Found: ' + found;
      self.error('Type error in \'' + node.text + '\'', details);
      self.highlight(node);

    },
    getMarker: function getMarker(){
      return self.marker;
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
