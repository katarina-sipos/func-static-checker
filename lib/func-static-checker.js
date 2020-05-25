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
    //
    /**
     * This function is called then the package is activated.
     * It sets that on save, the content of the file with '.func' suffix is loaded
     * and the static analysis process is triggered.
     */
    toggle() {
        let controller = require('./controller');
        console.log("func-static-checker was successfully toggled");
        atom.notifications.addInfo("Func static-checker is alive.");
        if (atom.workspace.getActiveTextEditor() == null) return;
        this.destroyNotifications();
        atom.workspace.getActiveTextEditor().buffer.onDidSave(() => {
          this.destroyNotifications();
            const path = require("path");
            this.destroyMarkers();
            const filePath = atom.workspace.getActiveTextEditor().buffer.file.getPath();
            if (path.extname(filePath) === ".func") { //in case of func language file do
                const fs = require("fs");
                fs.readFile(filePath, (err, data) => {
                    if (err) throw err;
                    console.log("success in reading file content");
                    controller.main(data);
                });
            }
        });
    },
    /**
     * Markers are the highlighted areas in the editor.
     * On save, all the highlighted errors and warnings from the active text editor are disposed.
     */
    destroyMarkers: function destroyMarkers() {
        const markers = atom.workspace.getActiveTextEditor().getMarkers();
        if (markers !== null) {
            markers.forEach(m => m.destroy());
        }
    },
    /**
     * On save, all old notifications are disposed.
     */
    destroyNotifications: function destroyNotifications() {
        const allNotifications = atom.notifications.getNotifications();
        if (allNotifications == null) return;
        allNotifications.forEach(notification =>{
          notification.dismiss();
        });
    },
};
