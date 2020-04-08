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
    self.highlight(node);
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
    self.highlight(node);

  },
  notDefined: function notDefined(node) {
    self.error('Function \'' + node.text + '\' is not defined.', "", node);
    self.highlight(node);

  },
  highlight: function hightlight(node) {
    self.marker = atom.workspace.getActiveTextEditor().markBufferRange([
      [node.startPosition.row, node.startPosition.column],
      [node.endPosition.row, node.endPosition.columns]
    ]);
    atom.workspace.getActiveTextEditor().decorateMarker(self.marker, {
      type: 'line',
      class: 'errorC'
    });
    // atom.tooltips.add(self.marker, {title: 'This is a tooltip'});
    /*let textEditorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
    //let elms = textEditorElement.getElementsByClassName('line errorC');
    //console.log(elms);
    setTimeout(
      //console.log(elms.item(0));
()=>{
          let elms=textEditorElement.getElementsByClassName('errorC');
         atom.tooltips.add(elms.item(0), {title: 'This is a tooltip',
         trigger: 'click',placement: 'left',
class:'mytooltip'});

}, 0);*/


  },
  wrongNumOfArgs: function wrongNumOfArgs(node) {
    self.error('Wrong number of arguments in \'' + node.text + '\'.', "", node);
    self.highlight(node);
  },
  wrongArgTypes: function wrongArgTypes(expected, found, node) {
    let details = 'Expected types of agruments: \'' + expected.text + '\'. ';
    details = details + 'Found: ' + found;
    self.error('Type error in \'' + node.text + '\'', details, node);
    self.highlight(node);

  },
  getMarker: function getMarker() {
    return self.marker;
  },
  wrongReturnType: function wrongReturnType(node, expected, found, statement) {
    let details = 'Expected return type for \'' + node.text + '\' is ' + expected.text;
    details = details + '. Defined body might result in \'' + found + '\'.';
    self.error('Type error in \'' + statement.text + '\'.', details, node);
    self.highlight(node);
  },
  undefinedArgError: function undefinedArgError(node) {
    self.error('Undefined function argument used in \'' + node.text + '\'', "", node);
    self.highlight(node);
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
    self.marker = atom.workspace.getActiveTextEditor().markBufferRange([
      [node.startPosition.row, node.startPosition.column],
      [node.endPosition.row, node.endPosition.columns]
    ]);
    atom.workspace.getActiveTextEditor().decorateMarker(self.marker, {
      type: 'line',
      class: 'my-warning'
    });
    /*  let tooltipContent = 'Check function name'+' \''+node.text+'\'</br></hr></br></br>'+'Function name doesn\'t follow</br>the camelCase convention.'

let textEditorElement = atom.views.getView(atom.workspace.getActiveTextEditor());

    setTimeout(
    //console.log(elms.item(0));
    () => {

      let elms = textEditorElement.getElementsByClassName('my-warning');
      for(let i=0;i<elms.length;i++){
        self.disposable=atom.tooltips.add(elms.item(i), {
            title: tooltipContent,
            trigger: 'click',
            placement: 'left',
            class: 'mytooltip',
            html: true
          });
      }*/
    /*  atom.tooltips.add(elms.item(0), {
        title: 'This is a tooltip',
        trigger: 'click',
        placement: 'left',
        class: 'mytooltip'
      });*/




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
