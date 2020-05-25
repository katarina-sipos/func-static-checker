class DerivationTreeView {
    constructor() {
        this.element = document.createElement('div');
    }

    /**
     * Used by Atom for tab text.
     * @returns {string} - display name of the tab
     */
    getTitle() {
        return 'Type derivations trees view';
    }

    /**
     * Sets the contents of the tab element so that is contains the type derivations trees.
     * @param data - HTML string with trees
     */
    update(data) {
        this.element.innerHTML = "";
        this.element.innerHTML = '<div class="type-tree-view">' + data + '</div>';
    }

    /**
     * This tells atom, which dock (top, bottom, left, right) should be chosen for the view.
     * @returns {string} - position of the tab
     */
    getDefaultLocation() {
        return 'left';
    }
}

module.exports = DerivationTreeView;