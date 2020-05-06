"use babel";

import FuncStaticCheckerView from "./func-static-checker-view";

import {
  CompositeDisposable
} from "atom";

export default {
  funcStaticCheckerView: null,
  modalPanel: null,
  subscriptions: null,
  activate(state) {
    this.funcStaticCheckerView = new FuncStaticCheckerView(
      state.funcStaticCheckerViewState
    );
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.funcStaticCheckerView.getElement(),
      visible: false
    });
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
        // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "func-static-checker:toggle": () => this.toggle()
      })
    );
    /*this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "func-static-checker:tree": () => this.tree()
      })
    );*/
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.funcStaticCheckerView.destroy();
  },

  serialize() {
    return {
      funcStaticCheckerViewState: this.funcStaticCheckerView.serialize()
    };
  },
  //this function is called on save currently opened file in Atom editor
  toggle() {
    /*if(atom.workspace.getRightPanels()!=null){
      atom.workspace.getRightPanels().forEach((item, i) => {
        item.destroy();
      });

    }*/
      // and load the index.html of the app.
      //win.loadFile('index.html')
        let controler = require('./controler');
       //var action = require("./parsing"); //module for handling operations with AST
        console.log("func-static-checker was successfully toggled");
        atom.notifications.addInfo("Func static-checker is alive.");
    if (atom.workspace.getActiveTextEditor() == null) return;
    atom.workspace.getActiveTextEditor().buffer.onDidSave(() => {
      const path = require("path");
      this.destroyMarkers();
      const filePath = atom.workspace.getActiveTextEditor().buffer.file.getPath();
      if (path.extname(filePath) === ".func") { //in case of func language file do
        const fs = require("fs");
        fs.readFile(filePath, (err, data) => {
          if (err) throw err;
          console.log("success in reading file content");
          //self.parser.parsingAction(data);
          controler.main(data);
        });
      }
      this.destroyNotifications();

    });
        //var activeWin =atom.workspace.getActiveTextEditor();
        /*if(atom.workspace.getActiveTextEditor()==null) return;
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
              //controler.main();
              action.parsingAction(data);
            });
          }
          var allNotifications =atom.notifications.getNotifications();
          allNotifications.forEach( notification => notification.dismiss());*/

        //});
        /*return (
                this.modalPanel.isVisible() ?
                this.modalPanel.hide() :
                this.modalPanel.show()
              );*/
  },
  destroyMarkers: function destroyMarkers() {
    const markers = atom.workspace.getActiveTextEditor().getMarkers();
    if (markers !== null) {
      markers.forEach(m => m.destroy());
    }
  },
  destroyNotifications: function destroyNotifications() {
    const allNotifications = atom.notifications.getNotifications();
    if (allNotifications == null) return;
    allNotifications.forEach(notification => notification.dismiss());
  },
};
