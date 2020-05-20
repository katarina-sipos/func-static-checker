class DerivationTreeView {
    constructor() {
        this.element = document.createElement('div');
    }

    getTitle() {
        // Used by Atom for tab text
        return 'Typing rules tree view';
    }

    update(data) {
        this.element.innerHTML = "";
        this.element.innerHTML = '<div class="type-tree-view">' + data + '</div>';
    }

    //this item will be inserted in bottom dock
    getDefaultLocation() {
        return 'left';
    }
}

module.exports = DerivationTreeView;