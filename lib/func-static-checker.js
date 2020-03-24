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
    var action = require("./parsing"); //module for handling operations with AST
    console.log("func-static-checker was successfully toggled");
    atom.notifications.addInfo("Func static-checker is alive.");
    atom.workspace.getActiveTextEditor().buffer.onDidSave(() => {
      const path = require("path");
      const filePath = atom.workspace
        .getActiveTextEditor()
        .buffer.file.getPath();
      if (path.extname(filePath) == ".func") { //in case of func language file do
        const fs = require("fs");
        fs.readFile(filePath, (err, data) => {
          if (err) throw err;
          console.log("success in reading file content");
          action.parsingAction(data);
        });
      }
    });
    /*return (
            this.modalPanel.isVisible() ?
            this.modalPanel.hide() :
            this.modalPanel.show()
          );*/
  }
};
