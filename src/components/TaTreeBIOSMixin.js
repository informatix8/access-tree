'use strict';

import _ from 'lodash';

/**
 * Connect Tree BIOS models’ API to a Vue app
 * @mixin TaTreeBIOSMixin
 */
const TaTreeBIOSMixin = {

    methods: {
        /**
         * Focus a node and if it’s selectable, select it
         * @method _focusAndSelectNode
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        _focusAndSelectNode(node) {
            node.focus();
            if (node.selectable()) {
                //node.state('loadingContent', true);
                node.loadingContent = true;
                node.select();
            }
        },
        /**
         * Move DOM focus to the node’s body
         * @method _DOMFocusNode
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        _DOMFocusNode(node) {
            document.getElementById(node.id + '-node-body').focus();
        },
        /**
         * Move model focus from one node to another and focus the associated DOM element
         * @method _moveFocus
         * @memberOf TaTreeBIOSMixin
         * @param from {TreeNode}
         * @param to {TreeNode}
         */
        _moveFocus(from, to) {
            if (!_.isUndefined(to)) {
                from.blur();
                to.focus();
                this._DOMFocusNode(to);
            }
        }
    }
};

export {
    TaTreeBIOSMixin
};
