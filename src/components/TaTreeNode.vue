<template>
    <div class="ta-tree-node ta-tree-node-body-clickable" role="treeitem" v-bind:id="componentId" v-bind:class="nodeBodyClasses" v-bind:aria-expanded="aria.expanded" v-bind:aria-selected="aria.selected" v-bind:aria-level="treeLevel">
        <div class="ta-tree-node-body" v-bind:tabindex="tabindex" v-bind:id="nodeBodyId" v-on:click="onClickNodeBody" v-on:mouseenter="onMouseEnterBody" v-on:mouseleave="onMouseLeaveBody" v-on:focusin="onFocusIn" v-on-clickaway="onClickAway" @keyup.enter="onEnterKey" @keyup.space="onSpaceKey" @keydown.space.prevent.stop="curtail" @keyup.up.prevent.stop="onArrowUpKey" @keyup.down.prevent.stop="onArrowDownKey" @keydown.up.prevent="curtail" @keydown.down.prevent="curtail" @keyup.left.prevent="onArrowLeftKey" @keyup.right.prevent="onArrowRightKey" @keydown.left.prevent="curtail" @keydown.right.prevent="curtail" @keyup.home.prevent="onHomeKey" @keyup.end.prevent="onEndKey" @keydown.home.prevent="curtail" @keydown.end.prevent="curtail">
            <div class="ta-tree-node-prefix">
                <slot name="node-prefix" :node="node" :model="model" :treeNode="this">
                    <div class="ta-tree-node-action" v-show="node.loading()"><span class="fa fa-spinner" aria-label="Loading children."></span></div>
                    <button class="ta-tree-node-action ta-tree-expandable-action" tabindex="-1" v-if="node.hasOrWillHaveChildren() &amp;&amp; node.loading() === false" v-on:click.stop="onClickExpandCollapse"></button>
                    <div class="ta-tree-node-action placeholder" v-if="!node.hasOrWillHaveChildren()"></div>
                    <div class="ta-tree-node-action" v-if="model.enableCheckboxes !== false">
                        <input class="ta-tree-checkbox" v-model="localNodeChecked" v-indeterminate="indeterminate" type="checkbox" tabindex="-1" v-on:click.stop="onClickCheckbox">
                    </div>
                </slot>
            </div>
            <div class="ta-tree-node-content" v-bind:ta-tree-prefix-actions="prefixActionCount" v-bind:class="nodeContentClasses" v-on:mouseenter="onMouseEnterContent" v-on:mouseleave="onMouseLeaveContent"><a class="ta-tree-node-label" tabindex="-1" v-bind:title="truncatedTitleText"><span>{{ truncatedLabelText }}</span><span v-if="node.value !== undefined"><span class="json-separator" aria-separator="true">:</span><span class="json-value">{{ node.value }}</span></span><span v-else-if="node.childType === 'object' &amp;&amp; node.text !== '{'" aria-separator="true"><span class="json-separator">:</span><span class="json-open-brace">{</span></span><span v-else-if="node.childType === 'array' &amp;&amp; node.text !== '['" aria-separator="true"><span class="json-separator">:</span><span class="json-open-bracket">[</span></span></a></div>
            <div class="ta-tree-node-suffix">
                <div class="ta-tree-node-action" v-if="node.loadingContent"><span class="fa fa-spinner" aria-label="Loading content."></span></div>
                <button class="ta-tree-node-action fa fa-check" v-if="node.requiredField" tabindex="-1"></button>
                <button class="ta-tree-node-action fa fa-exclamation-triangle" v-if="node.stripField" tabindex="-1"></button>
                <button class="ta-tree-node-action fa fa-floppy-o" v-if="node.mutableField" tabindex="-1"></button><a class="ta-tree-node-action back-end-model" v-if="node.backEndModel !== undefined" tabindex="-1" @click="$emit('node-action', node)">{{ node.backEndModel }}</a>
            </div>
        </div>
        <div class="ta-tree-group" role="group" v-if="node.hasOrWillHaveChildren()" v-show="node.expanded()" v-bind:ta-tree-level="treeLevel + 1">
            <ta-tree-node v-for="(treeNode) in treeNodes" v-bind:model="model" v-bind:tree-level="treeLevel + 1" v-bind:node="treeNode" v-bind:node-checked="treeNode.checked()" v-bind:tree-focused="treeFocused" v-bind:key="treeNode.id" @node-action="$emit('node-action', $event)">
                <template v-slot:node-prefix="slotProps">
                    <slot name="node-prefix" :node="slotProps.node" :treeNode="slotProps.treeNode">
                        <div class="ta-tree-node-action" v-show="slotProps.node.loading()"><span class="fa fa-spinner" aria-label="Loading children."></span></div>
                        <button class="ta-tree-node-action ta-tree-expandable-action" tabindex="-1" v-if="slotProps.node.hasOrWillHaveChildren() &amp;&amp; slotProps.node.loading() === false" @click.stop="slotProps.treeNode.onClickExpandCollapse"></button>
                        <div class="ta-tree-node-action placeholder" v-if="!slotProps.node.hasOrWillHaveChildren()"></div>
                        <div class="ta-tree-node-action" v-if="slotProps.treeNode.model.enableCheckboxes !== false">
                            <input class="ta-tree-checkbox" v-model="slotProps.treeNode.localNodeChecked" v-indeterminate="slotProps.treeNode.indeterminate" type="checkbox" tabindex="-1" @click.stop="slotProps.treeNode.onClickCheckbox">
                        </div>
                    </slot>
                </template>
            </ta-tree-node>
        </div>
        <div class="ta-tree-node-footer" v-bind:tree-level="treeLevel">
            <div class="json-close-bracket" v-if="node.childType === 'array' &amp;&amp; node.expanded()" aria-separator="true">]</div>
            <div class="json-close-brace" v-else-if="node.childType === 'object' &amp;&amp; node.expanded()" aria-separator="true">}</div>
        </div>
    </div>
</template>
<script>
'use strict';

import VueClickaway from 'vue-clickaway';
import {TreeBIOS} from '@informatix8/tree-bios';
import {TaTreeControlMixin} from '@/components/TaTreeControlMixin';
import _ from 'lodash';
import prune from 'underscore.string/prune';

const LEADING = {
    leading: true,
    trailing: false
};

//const TRAILING = {
//    leading: false,
//    trailing: true
//};

/**
 * A tree node UI component
 * @module TaTreeNode
 * @mixes TaTreeControlMixin
 * @property {TaTreeBIOS} model **prop** the entire data model
 * @property {TreeNode} node **prop** the data model itself
 * @property {Boolean} nodeFocused **prop** whether or not the node is checked in the data model
 * @property {Boolean} treeFocused **prop**  whether or not the tree contains focus
 * @property {String} componentId **computed** unique ID for a node used for DOM
 * @property {String} nodeBodyId **computed** unique ID for a node’s body used for DOM
 * @property {Boolean} indeterminate **computed** whether or not this node’s model is indeterminate
 * @property {TreeNodes} treeNodes **computed** collection of `TreeNode` instances
 * @property {Object} nodeBodyClasses **computed** classes to apply to the tree node
 * @property {Object} nodeContentClasses **computed** classes to apply to the tree node’s content container
 * @property {Object} aria **computed** calculated ARIA values
 * @property {Number} tabindex **computed** whether or not this node is focusable, either `0` or `-1`
 * @property {String} truncatedLabelText **computed** How many characters of the node’s text to show in the anchor label
 * @property {String} truncatedTitleText **computed** How many characters to allow in the `title` attribute of the anchor label
 * @property {Number} prefixActionCount **computed** How many items precede the node text label? +1 if it’s a parent (expand/collapse control), +1 if there’s a checkbox
 * @property {Boolean} localNodeChecked **data** a local copy of the `nodeChecked` so that I may change it myself in a v-model and then emit changes to it
 * @property {Boolean} bodyHovered **data** whether or not this node has a cursor over it
 * @property {Boolean} contentHovered **data** whether or not this node’s content has a cursor over it
 */
export default {
    name: 'TaTreeNode',
    mixins: [TaTreeControlMixin],
    props: {
        model: {
            type: Object,
            required: true
        },
        node: {
            type: Object,
            required: true
        },
        nodeChecked: {
            type: Boolean,
            required: true
        },
        treeFocused: {
            type: Boolean,
            required: true
        }
    },
    directives: {
        indeterminate(el, binding) {
            el.indeterminate = Boolean(binding.value);
        },
        onClickaway: VueClickaway.directive
    },
    data() {
        return {
            localNodeChecked: this.nodeChecked,
            bodyHovered: false,
            contentHovered: false
        };
    },
    watch: {
        nodeChecked() {
            this.localNodeChecked = this.nodeChecked;
        }
    },
    computed: {
        nodeFocused() {
            return this.node.focused();
        },
        prefixActionCount() {
            let count = 0;

            // if (true || this.node.hasOrWillHaveChildren()) { //FIXME if any node has children?
                count++;
            // }

            if (this.model.enableCheckboxes !== false) {
                count++;
            }

            return count;
        },
        componentId() {
            return this.node.id;
        },
        nodeBodyId() {
            return this.node.id + '-node-body';
        },
        indeterminate() {
            return this.node.indeterminate();
        },
        treeNodes() {
            return _.filter(this.node.getChildren(), TreeBIOS.isTreeNode);
        },
        nodeBodyClasses() {
            return {
                'body-hovered': this.bodyHovered === true,
                'content-hovered': this.contentHovered === true,
                focused: this.nodeFocused,
                selected: this.node.selected(),
                selectable: this.node.selectable(),
                'not-selectable': !this.node.selectable(),
                expanded: this.node.expanded(),
                collapsed: this.node.collapsed(),
                checked: this.node.checked(),
                indeterminate: this.node.indeterminate(),
                loading: this._loadingChildrenOrContent(),
                loaded: !this._loadingChildrenOrContent(),
                'loading-children': this.node.loading(),
                'loading-content': this.node.loadingContent === true,
                'has-or-will-have-children': this.node.hasOrWillHaveChildren(), //either children are loaded or they can be loaded
                'no-children': !this.node.hasOrWillHaveChildren(), //no children exist
                'has-children': this.node.hasChildren() //children exist and are loaded
            };
        },
        nodeContentClasses() {
            return {
                'content-hovered': this.contentHovered === true
            };
        },
        aria() {
            return {
                selected: this.node.selected(),
                expanded: this._ariaExpandedLogic()
            };
        },
        tabindex() {
            if (this.node.focused()) {
                return 0;
            }

            return -1;
        },
        truncatedLabelText() {
            //if (!_.isUndefined(this.node.childType) && (this.node.childType === 'object' || this.node.childType === 'array') && this.node.text === '{}') {
            //    return '';
            //}
            if (this.model.truncateNodeText) {
                return prune(this.node.text, this.model.truncateNodeTextLength);
            }
            return this.node.text;
        },
        truncatedTitleText() {
            if (this.model.truncateNodeText) {
                return prune(this.node.text, this.model.truncateNodeTitleLength);
            }
            return this.node.text;
        }
    },
    methods: {
        /**
         * Is anything loading?
         * @method _loadingChildrenOrContent
         * @instance
         * @returns {Boolean}
         */
        _loadingChildrenOrContent() {
            return (this.node.loading() || this.node.loadingContent === true);
        },
        /**
         * Should the `aria-expanded` attribute be included?
         * @method _ariaExpandedLogic
         * @instance
         * @returns {(Boolean|String)} Returns a boolean `false` or string value `true` or `false`
         */
        _ariaExpandedLogic() {
            if (this.node.hasOrWillHaveChildren() && this.node.expanded()) {
                return 'true';
            }
            else if (this.node.hasOrWillHaveChildren() && this.node.collapsed()) {
                return 'false';
            }
            else {
                return false;
            }
        },
        /**
         * Handle click on expand/collapse element
         * @method onClickExpandCollapse
         * @instance
         * @fires do-click-expand-collapse-
         */
        onClickExpandCollapse() {
            this.biosBus.$emit('do-click-expand-collapse-' + this.model.id, this.node);
        },
        /**
         * Emit primary node action event
         * @method doPrimaryNodeAction
         * @instance
         * @param {String} eventPrefix
         * @fires do-enter-
         * @fires do-click-node-body-
         */
        doPrimaryNodeAction(eventPrefix) {
            this.biosBus.$emit(eventPrefix + this.model.id, this.node);
        },
        /**
         * Handle click in node’s body
         * @method onClickNodeBody
         * @instance
         */
        onClickNodeBody() {
            if (this.node.selectable()) {
                this.delayedPrimaryNodeAction('do-click-node-body-');
            }
        },
        /**
         * Handle click in checkbox
         * @method onClickCheckbox
         * @instance
         * @fires do-click-checkbox-
         */
        onClickCheckbox() {
            this.localNodeChecked = !this.localNodeChecked;
            this.biosBus.$emit('do-click-checkbox-' + this.model.id, this.node);
        },
        /**
         * Handle mouseenter event of a tree node
         * @method onMouseEnterBody
         * @instance
         */
        onMouseEnterBody() {
            this.bodyHovered = true;
        },
        /**
         * Handle mouseleave event of a tree node
         * @method onMouseLeaveBody
         * @instance
         */
        onMouseLeaveBody() {
            this.bodyHovered = false;
        },
        /**
         * Handle mouseenter event of a tree node
         * @method onMouseEnterContent
         * @instance
         */
        onMouseEnterContent() {
            this.contentHovered = true;
        },
        /**
         * Handle mouseleave event of a tree node
         * @method onMouseLeaveContent
         * @instance
         */
        onMouseLeaveContent() {
            this.contentHovered = false;
        },
        /**
         * Handle focusin event of a tree node
         * @method onFocusIn
         * @instance
         * @fires do-focus-in-
         */
        onFocusIn() {
            //focus the DOM node when anything within the node body actionable area has focus
            this.biosBus.$emit('do-focus-in-' + this.model.id, this.node);
        },
        /**
         * Handle click away action of a tree node
         * @method onClickAway
         * @instance
         * @fires do-blur-
         */
        onClickAway() {
            if (this.treeFocused && this.node.focused()) {
                this.biosBus.$emit('do-blur-' + this.model.id, this.node);
            }
        },
        /**
         * Handle arrow up keyup event
         * @method onArrowUpKey
         * @instance
         * @fires do-arrow-up-
         */
        onArrowUpKey() {
            this.biosBus.$emit('do-arrow-up-' + this.model.id, this.node);
        },
        /**
         * Handle arrow down keyup event
         * @method onArrowDownKey
         * @instance
         * @fires do-arrow-down-
         */
        onArrowDownKey() {
            this.biosBus.$emit('do-arrow-down-' + this.model.id, this.node);
        },
        /**
         * Handle arrow left keyup event
         * @method onArrowLeftKey
         * @instance
         * @fires do-arrow-left-
         */
        onArrowLeftKey() {
            this.biosBus.$emit('do-arrow-left-' + this.model.id, this.node);
        },
        /**
         * Handle arrow right keyup event
         * @method onArrowRightKey
         * @instance
         * @fires do-arrow-right-
         */
        onArrowRightKey() {
            this.biosBus.$emit('do-arrow-right-' + this.model.id, this.node);
        },
        /**
         * Handle home keyup event
         * @method onHomeKey
         * @instance
         * @fires do-home-
         */
        onHomeKey() {
            this.biosBus.$emit('do-home-' + this.model.id, this.node);
        },
        /**
         * Handle end keyup event
         * @method onEndKey
         * @instance
         * @fires do-end-
         */
        onEndKey() {
            this.biosBus.$emit('do-end-' + this.model.id, this.node);
        },
        /**
         * Handle enter keyup event
         * @method onEnterKey
         * @instance
         */
        onEnterKey() {
            if (this.node.selectable()) {
                this.delayedPrimaryNodeAction('do-enter-');
            }
        },
        /**
         * Handle space keyup event
         * @method onSpaceKey
         * @instance
         * @fires do-space-
         */
        onSpaceKey() {
            this.biosBus.$emit('do-space-' + this.model.id, this.node);
        },
        /**
         * Stop default browser behavior
         * @method curtail
         * @instance
         * @returns {Boolean} false
         */
        curtail() {
            return false;
        }
    },
    created() {
        this.boundPrimaryNodeAction = this.doPrimaryNodeAction.bind(this);

        /**
         * Make a leading debounced call to `doPrimaryNodeAction` after a user event of click or the enter key on a node body - given the model’s `delayPrimaryNodeAction` configuration parameter
         * @method delayedPrimaryNodeAction
         * @instance
         */
        this.delayedPrimaryNodeAction = _.debounce(this.boundPrimaryNodeAction, this.model.delayPrimaryNodeAction, LEADING);
    }
};
</script>
