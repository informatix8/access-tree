'use strict';

import Vue from 'vue';

const biosBus = new Vue();

const TaTreeControlMixin = {
    /**
     * Common parts for Tree controls
     * @mixin TaTreeControlMixin
     * @property {Vue} biosBus **data** A Vue instance to pass messages from any child’s level of depth to the parent model component
     * @property {TaTreeBIOS} model **prop** Instance of tree BIOS data model
     * @property {Number} [treeLevel=1] **prop** Indicates depth of tree node
     */
    data() {
        return {
            biosBus: biosBus
        };
    },
    props: {
        model: {
            type: Object,
            required: true
        },
        treeLevel: {
            type: Number,
            required: false,
            default: 1
        }
    }
};

export {
    TaTreeControlMixin
}
