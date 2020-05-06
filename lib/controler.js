let self = module.exports = {
    parsing: parsing = require('./parsing'),
    check: check=require('./check'),
    main: function main(data) {
      self.parsing.parsingAction(data);

    }
};


/*

var activeWin =atom.workspace.getActiveTextEditor();
if(activeWin==null) return;
atom.workspace.getActiveTextEditor().buffer.onDidSave(() => {
  const path = require("path");
  const display = require('./display');
  let markers = atom.workspace.getActiveTextEditor().getMarkers();
  if(markers !== null){
    markers.forEach( m => m.destroy());
  }
  if(display.disposable != null){
    display.disposable.dispose();
    display.disposable=null;

  }
  if(atom.workspace.getRightPanels()!=null){
    atom.workspace.getRightPanels().forEach((item, i) => {
      item.destroy();
    });

  }
  //let myView = atom.views.getView(myModel);
  //viewProviderSubscription.dispose();
  const filePath = atom.workspace
    .getActiveTextEditor()
    .buffer.file.getPath();
  if (path.extname(filePath) === ".func") { //in case of func language file do
    const fs = require("fs");
            fs.readFile(filePath, (err, data) => {
      if (err) throw err;
      console.log("success in reading file content");
      controler.main();
      //action.parsingAction(data);
    });
  }
  var allNotifications =atom.notifications.getNotifications();
  allNotifications.forEach( notification => notification.dismiss());

});


*/
