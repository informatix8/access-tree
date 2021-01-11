'use strict';

import _ from 'lodash';
import {TreeBIOS} from '@informatix8/tree-bios';

/**
 * Connect Tree BIOS models’ API to a Vue app or Vue component
 */
export default function bindHandlersToModel (model, component) {
    if (!model || !model.focused) {
        return {};
    }
    return {
        /**
         * Execute the click expand/collapse toggle action of a node
         * @memberOf bindHandlersToModel
         * @param node {TreeNode}
         */
        'do-click-expand-collapse' (node) {
            node.toggleCollapse();
        },
        /**
         * Execute the click action in a node’s body - select the node
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-click-node-body' (node) {
            component._focusAndSelectNode(node);
        },
        /**
         * Execute a click action on a node’s checkbox - toggle a node’s checkbox
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-click-checkbox' (node) {
            node.toggleCheck();
            if (node.hasParent()) {
                node.itree.parent.refreshIndeterminateState();
            }
        },
        /**
         * Unfocus all focused nodes
         * @memberOf TaTreeBIOSMixin
         * @param model {TaTreeBIOS}
         * @deprecated
         */
        'do-unfocus-nodes' () {
            const focusedNodes = model.focused();

            if (TreeBIOS.isTreeNodes(focusedNodes) && !_.isUndefined(model.lastSelectedNode())) {
                focusedNodes.forEach((node) => {
                    node.blur();
                });
            }
        },
        /**
         * Upon exiting the tree, focus the selected node so the user may use the tab key to return to the tree at that node
         * @memberOf TaTreeBIOSMixin
         * @param model {TaTreeBIOS}
         */
        'do-model-focus-selected-nodes' () {
            const selectedNodes = model.selected();
            let node = null;

            if (TreeBIOS.isTreeNodes(selectedNodes)) {
                node = selectedNodes[0];

                if (TreeBIOS.isTreeNode(node)) {
                    node.focus();
                }
            }
        },
        /**
         * Execute arrow down key logic
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-arrow-down'(node) {
            component._moveFocus(node, node.nextVisibleNode());
        },
        /**
         * Execute arrow up key logic
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-arrow-up' (node) {
            component._moveFocus(node, node.previousVisibleNode());
        },
        /**
         * Execute arrow left key logic
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-arrow-left' (node) {
            const nodeParent = node.getParent();
            let nodeToFocus;

            if (node.hasChildren() && node.expanded()) {
                // I have kids and I’m open, therefore collapse, but keep focus

                node.collapse();
                nodeToFocus = node;
            }
            else if (TreeBIOS.isTreeNode(nodeParent)) {
                // I have a parent, therefore blur myself and focus my parent

                //console.log('parent is ', nodeParent.id);

                nodeParent.focus();
                nodeToFocus = nodeParent;
            }
            else {
                //console.log('do nothing!');
                return;
            }

            component._DOMFocusNode(nodeToFocus); // I actually have to put DOM focus back on the model’s focused node because the DOM focused node was a child and has disappeared
        },
        /**
         * Execute arrow right key logic
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-arrow-right' (node) {
            if (node.hasOrWillHaveChildren() && node.collapsed()) {
                node.expand();
            }
            else if (node.hasChildren() && node.expanded()) {
                component._moveFocus(node, node.nextVisibleNode());
            }
        },
        /**
         * Execute the home key procedure - focus the first node in the tree
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         * @param model {TaTreeBIOS}
         */
        'do-home' (node) {
            const firstNode = model.get(0);
            node.blur();
            firstNode.focus();
            component._DOMFocusNode(firstNode);
        },
        /**
         * Execute the end key procedure - focus the last visible node in the tree
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         * @param model {TaTreeBIOS}
         */
        'do-end' (node) {
            const lastRootNode = model.get(model.model.length - 1);
            node.blur();

            //TEMP
            lastRootNode.focus();
            component._DOMFocusNode(lastRootNode);

            //FIXME
            //if (lastRootNode.collapsed()) {
            //    lastRootNode.focus();
            //    document.getElementById(lastRootNode.id + '-node-body').focus();
            //}
            //else if (lastRootNode.expanded()) {
            // TODO find last visible child in the entire tree - recursion
            //}
        },
        /**
         * Execute the enter key procedure - select a node
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-enter' (node) {
            component._focusAndSelectNode(node);
        },
        /**
         * Execute the space bar procedure - toggle a node’s checkbox
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-space' (node) {
            node.toggleCheck();
            if (node.hasParent()) {
                node.itree.parent.refreshIndeterminateState();
            }
        },
        /**
         * Blur (unfocus) a specific node
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-blur' (node) {
            node.blur();
        },
        /**
         * Focus a node in the model and DOM
         * @memberOf TaTreeBIOSMixin
         * @param node {TreeNode}
         */
        'do-focus-in' (node) {
            node.focus();
            component._DOMFocusNode(node);
        }
    }
}
