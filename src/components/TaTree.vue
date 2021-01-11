<template>
    <div class="ta-tree-universe" v-bind:class="globalClasses">
        <div class="ta-tree-expanse" v-if="expandable">
            <button class="ta-tree-expand-button" type="button" v-bind:id="expandButtonId" v-bind:aria-label="expandButtonAriaLabel" v-bind:aria-controls="expandPanelId" @click="onExpandClick"><span class="ta-icon-expand" aria-hidden="true"></span></button>
        </div>
        <div class="ta-tree-panel" v-show="showPanel" v-bind:aria-expanded="aria.expanded" v-bind:id="expandPanelId">
            <div class="ta-tree-placeholders" v-if="model.rootNodesLoading">
                <content-placeholders v-for="(placeholder, idx) in placeholders" v-bind:key="componentId + '-placeholder-' + idx">
                    <content-placeholders-text :lines="1"></content-placeholders-text>
                </content-placeholders>
            </div>
            <div v-else>
                <slot name="header"></slot>
                <div class="ta-tree ta-tree-has-suffix ta-tree-expand-plus">
                    <div class="ta-tree-container" role="tree" v-bind:id="componentId" v-bind:class="treeClasses" @keyup="onSignificantKey" v-on:focusin="onFocusIn" v-on:keydown.tab="onTabOutKey" v-on-clickaway="onClickAway">
                        <ta-tree-node v-for="(treeNode) in treeNodes" v-bind:model="model" v-bind:tree-level="1" v-bind:node="treeNode" v-bind:node-checked="treeNode.checked()" v-bind:tree-focused="focused" v-bind:key="treeNode.id"></ta-tree-node>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
'use strict';

import {TaTreeControlMixin} from '@/components/TaTreeControlMixin';
import VueClickaway from 'vue-clickaway';
import _ from 'lodash';
import {TreeBIOS} from '@informatix8/tree-bios';
import TaTreeNode from '@/components/TaTreeNode';

const META_KEYS = ['meta', 'tab', 'capslock', 'control', 'alt', 'shift', 'home', 'end', 'pageup', 'pagedown', 'insert', 'up', 'down', 'left', 'right', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'delete', 'enter', 'spacebar'];
for (let i = 1; i < 13; i++) {
    META_KEYS.push('f' + i);
}

const TRAILING = {
    leading: false,
    trailing: true
};

/**
 * A tree UI component that contains root tree nodes
 * @module TaTree
 * @mixes TaTreeControlMixin
 * @property {Number} [placeholders=20] **prop** Number of content placeholders to display while root nodes are loading
 * @property {Boolean} [expanded=false] **prop** Is the tree expanded?
 * @property {Boolean} [expandable=false] **prop** Can the tree expand and collapse?
 * @property {Boolean} [autoCollapse=false] **prop** Should the tree collapse itself at a certain screen size?
 * @property {String} [expandButtonAriaLabel='Toggle tree expanded or collapsed.'] **prop** ARIA label for the expand button.
 * @property {String} componentId **computed** unique ID for a node used for DOM
 * @property {TreeNodes} treeNodes **computed** collection of `TreeNode` instances
 * @property {Object} treeClasses **computed** classes to apply to the tree
 * @property {Object} globalClasses **computed** classes to apply to the outermost container element
 * @property {Object} aria **computed** calculated ARIA values
 * @property {String} expandPanelId **computed** unique ID for the tree’s panel for the DOM
 * @property {String} expandButtonId **computed** unique ID for the tree’s expand button for the DOM
 * @property {Boolean} showPanel **computed** Should the tree be shown at this moment?
 * @property {Boolean} aboveAutoCollapseThreshold **computed** `null` if not both `expandable && autoCollapse`
 * @property {Boolean} belowAutoCollapseThreshold **computed** `null` if not both `expandable && autoCollapse`
 * @property {Boolean} pristine **data** has focus ever entered the tree?
 * @property {Boolean} focused **data** does an element within the tree have DOM focus?
 * @property {Boolean} localExpanded **data** Copy of the `expanded` prop.
 */
export default {
    name: 'TaTree',
    mixins: [TaTreeControlMixin],
    components: {
        TaTreeNode
    },
    directives: {
        onClickaway: VueClickaway.directive
    },
    props: {
        placeholders: {
            required: false,
            type: Number,
            default: 20
        },
        expanded: {
            type: Boolean,
            default: false,
            required: false
        },
        expandable: {
            type: Boolean,
            default: false,
            required: false
        },
        expandButtonAriaLabel: {
            type: String,
            required: false,
            default: 'Toggle tree expanded or collapsed.'
        },
        autoCollapse: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data() {
        return {
            pristine: true,
            focused: false,
            delayedResize: null,
            localExpanded: this.expanded, //return a copy of the prop
            aboveAutoCollapseThreshold: null,
            belowAutoCollapseThreshold: null
        };
    },
    computed: {
        aria() {
            return {
                expanded: this._ariaExpandedLogic()
            };
        },
        componentId() {
            if (!_.isEmpty(this.model)) {
                return this.model.id;
            }
            return 'tree-' + this._uid;
        },
        treeNodes() {
            return _.filter(this.model.nodes(), TreeBIOS.isTreeNode);
        },
        treeClasses() {
            return {
                pristine: this.pristine === true,
                dirty: this.pristine !== true,
                focused: this.focused === true,
                'root-nodes-loading': this.rootNodesLoading === true,
                'json-tree': this.model.jsonTree === true
            };
        },
        globalClasses() {
            return {
                expandable: this.expandable === true,
                expanded: this.expandable === true && this.localExpanded === true,
                collapsed: this.expandable === true && this.localExpanded !== true,
                'auto-collapsable': this.autoCollapse === true,
                'above-auto-collapse-threshold': this.aboveAutoCollapseThreshold === true,
                'below-auto-collapse-threshold': this.belowAutoCollapseThreshold === true
            };
        },
        expandPanelId() {
            return this.model.id + '-tree-panel';
        },
        expandButtonId() {
            return this.model.id + '-tree-expand-button';
        },
        showPanel() {
            return (!this.expandable || (this.expandable && this.localExpanded));
        }
    },
    methods: {
        /**
         * Should the `aria-expanded` attribute be included?
         * @method _ariaExpandedLogic
         * @instance
         * @returns {(Boolean|String)} Returns a boolean `false` or string value `true` or `false`
         */
        _ariaExpandedLogic() {
            if (this.expandable) {
                if (this.localExpanded) {
                    return 'true';
                }

                return 'false';
            }

            return false;
        },
        /**
         * Do something when a non-meta character is pressed
         * @method onSignificantKey
         * @instance
         * @param {Event} e the DOM event
         */
        onSignificantKey(e) {
            const currentKey = e.key.toLowerCase();

            if (META_KEYS.indexOf(currentKey) === -1) { //not a meta key therefore something of significance
                if (currentKey === '*') {
                    this.onAsteriskKey(e);
                }
                else if (this._isPrintableCharacter(currentKey)) {
                    this.quickSearch(currentKey);
                }
                else {
                    //TODO
                    console.log('on significant key else:', currentKey);
                }
            }
        },
        /**
         * Handle an asterisk keyup event
         * @method onAsteriskKey
         * @instance
         */
        onAsteriskKey() {
            //TODO
            console.log('on *');
        },
        /**
         * Handle a tab keydown event
         * @method onTabOutKey
         * @instance
         */
        onTabOutKey() {
            if (this.focused) {
                this.doExitIntent();
            }
        },
        /**
         * Handle click away from the tree
         * @method onClickAway
         * @instance
         */
        onClickAway() {
            if (this.focused) {
                this.doExitIntent();
            }
        },
        /**
         * Procedure run upon user’s intent to exit the tree
         * @method doExitIntent
         * @instance
         * @fires do-model-focus-selected-nodes
         */
        doExitIntent() {
            this.focused = false;
            this.$emit('do-model-focus-selected-nodes', this.model);
        },
        /**
         * Handle focusin event
         * @method onFocusIn
         * @instance
         */
        onFocusIn() {
            this.focused = true;
            this.pristine = false;
        },
        /**
         * Determine if a character is printable or not
         * @method _isPrintableCharacter
         * @instance
         * @param {String} str a single character to test
         * @returns {Booelan}
         */
        _isPrintableCharacter(str) {
            return str.length === 1 && str.match(/\S/);
        },
        /**
         * Run quick node search feature
         * @method quickSearch
         * @instance
         * @param {String} letter the letter that was typed
         */
        quickSearch(letter) {
            //TODO
            console.log('quick search:', letter);
        },
        /**
         * Handle resize event, called by `delayedResize` and once upon mounting in the DOM
         * @method doResize
         * @instance
         */
        doResize() {
            if (typeof window !== 'undefined') {
                const mq = window.matchMedia('(min-width: ' + this.model.autoCollapseThreshold + 'px)')
                this.aboveAutoCollapseThreshold = mq();
            }
            this.belowAutoCollapseThreshold = !this.aboveAutoCollapseThreshold;

            if (this.localExpanded && this.belowAutoCollapseThreshold) {
                this.localExpanded = false;
            }
            else if (!this.localExpanded && this.aboveAutoCollapseThreshold) {
                this.localExpanded = true;
            }
        },
        /**
         * Handle the expand click
         * @method onExpandClick
         * @instance
         */
        onExpandClick() {
            this.localExpanded = !this.localExpanded;
            //TODO move DOM focus to the focusable model node
        }
    },
    watch: {
        expanded() {
            this.localExpanded = this.expanded; //changes from the top-down? Update my local copy
        }
    },
    created() {
        if (this.expandable && this.autoCollapse) {
            this.boundResize = this.doResize.bind(this);

            /**
             * Make a trailing debounced call to `doResize` after on the `window.resize` event given the model’s `delayResize` configuration parameter
             * @method delayedResize
             * @instance
             */
            if (typeof window !== 'undefined') {
                this.delayedResize = _.debounce(this.boundResize, this.model.delayResize, TRAILING);
                window.addEventListener('resize', this.delayedResize);
            }
        }

        /**
         *
         * @listens do-click-expand-collapse-
         * @fires do-click-expand-collapse
         */
        this.biosBus.$on('do-click-expand-collapse-' + this.model.id, (node) => {
            this.$emit('do-click-expand-collapse', node);
        });

        /**
         *
         * @listens do-click-node-body-
         * @fires do-click-node-body
         */
        this.biosBus.$on('do-click-node-body-' + this.model.id, (node) => {
            this.$emit('do-click-node-body', node);
        });

        /**
         *
         * @listens do-click-checkbox-
         * @fires do-click-checkbox
         */
        this.biosBus.$on('do-click-checkbox-' + this.model.id, (node) => {
            this.$emit('do-click-checkbox', node);
        });

        /**
         *
         * @listens do-arrow-up-
         * @fires do-arrow-up
         */
        this.biosBus.$on('do-arrow-up-' + this.model.id, (node) => {
            this.$emit('do-arrow-up', node);
        });
        /**
         *
         * @listens do-arrow-down-
         * @fires do-arrow-down
         */
        this.biosBus.$on('do-arrow-down-' + this.model.id, (node) => {
            this.$emit('do-arrow-down', node);
        });
        /**
         *
         * @listens do-arrow-left-
         * @fires do-arrow-left
         */
        this.biosBus.$on('do-arrow-left-' + this.model.id, (node) => {
            this.$emit('do-arrow-left', node);
        });
        /**
         *
         * @listens do-arrow-right-
         * @fires do-arrow-right
         */
        this.biosBus.$on('do-arrow-right-' + this.model.id, (node) => {
            this.$emit('do-arrow-right', node);
        });
        /**
         *
         * @listens do-blur-
         * @fires do-blur
         */
        this.biosBus.$on('do-blur-' + this.model.id, (node) => {
            this.$emit('do-blur', node);
        });
        /**
         *
         * @listens do-home-
         * @fires do-home
         */
        this.biosBus.$on('do-home-' + this.model.id, (node) => {
            this.$emit('do-home', node, this.model);
        });
        /**
         *
         * @listens do-end-
         * @fires do-end
         */
        this.biosBus.$on('do-end-' + this.model.id, (node) => {
            this.$emit('do-end', node, this.model);
        });
        /**
         *
         * @listens do-enter-
         * @fires do-enter
         */
        this.biosBus.$on('do-enter-' + this.model.id, (node) => {
            this.$emit('do-enter', node);
        });
        /**
         *
         * @listens do-space-
         * @fires do-space
         */
        this.biosBus.$on('do-space-' + this.model.id, (node) => {
            this.$emit('do-space', node);
        });
        /**
         *
         * @listens do-focus-in-
         * @fires do-focus-in
         */
        this.biosBus.$on('do-focus-in-' + this.model.id, (node) => {
            this.$emit('do-focus-in', node);
        });
    },
    mounted() {
        if (this.expandable && this.autoCollapse) {
            this.doResize();
        }
    },
    beforeDestroy() {
        if (this.delayedResize !== null) {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', this.delayedResize);
            }
            this.delayedResize = null;
        }
    }
};
</script>

<style lang="scss">
@import "@/assets/scss/_tree";
</style>
