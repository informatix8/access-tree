<template>
    <div id="app">
        <main class="gs-main" role="main">
            <div id="gs-app">
                <div class="gs-main-container">
                    <div class="gs-main-content">
                        <h1>Tree Demo</h1>
                        <div class="ta-card">
                            <div class="title">
                                <h2>1</h2>
                            </div>
                            <ta-tree :model="tmModel1" :expandable="false" :expanded="true" :auto-collapse="false"
                                     v-on="handlers1" />
                        </div>
                        <div class="ta-card">
                            <div class="title">
                                <h2>3</h2>
                            </div>
                            <ta-tree :model="tmModel3" :expandable="false" :expanded="true" :auto-collapse="false"
                                     v-on="handlers3" />
                        </div>
                        <div class="ta-card">
                            <div class="title">
                                <h2>5</h2>
                            </div>
                            <ta-tree :model="tmModel5" :expandable="false" :expanded="true" :auto-collapse="false"
                                     v-on="handlers5" />
                        </div>
                        <div class="ta-card">
                            <div class="title">
                                <h2>Gamma</h2>
                            </div>
                            <ta-tree :model="tmModelGamma" :expandable="false" :expanded="true" :auto-collapse="false"
                                     v-on="handlersGamma" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>
<script>
'use strict';

import _ from 'lodash';

import {TreeBIOS} from '@informatix8/tree-bios';
import TaTreeDataService from './TaTreeDataService';
import TaTree from '@/components/TaTree';
import {TaTreeBIOSMixin} from '@/components/TaTreeBIOSMixin';

import bindHandlersToModel from '@/bindHandlersToModel';

const treeDataServiceDemo1 = new TaTreeDataService({
    name: 'demo1'
});
const treeDataServiceDemo3 = new TaTreeDataService({
    name: 'demo3'
});
const treeDataServiceDemo5 = new TaTreeDataService({
    name: 'demo5'
});
const treeDataServiceGamma = new TaTreeDataService({
    name: 'gamma'
});

export default {
    name: 'GsTreeDemoApp',
    mixins: [TaTreeBIOSMixin],
    data() {
        const tmModel1 = new TreeBIOS({
            enableCheckboxes: false,
            truncateNodeText: false,
            jsonTree: true
        });
        const tmModel3 = new TreeBIOS({
            enableCheckboxes: false,
            truncateNodeText: false,
            jsonTree: true
        });
        const tmModel5 = new TreeBIOS({
            enableCheckboxes: false,
            truncateNodeText: false,
            jsonTree: true
        });
        const tmModelGamma = new TreeBIOS({
            enableCheckboxes: false,
            truncateNodeText: false,
            data(node, resolve) {

                if (_.isNull(node)) {
                    return treeDataServiceGamma.fetchHierarchyRoot();
                }
                else if (!_.isUndefined(node.tmid)) {
                    treeDataServiceGamma.fetchHierarchyNode(node.tmid).then((result) => {
                        resolve(result.children);
                    });
                }
                else {
                    throw 'Must have node tmid to do a lookup';
                }
            }
        });

        const handlers1 = bindHandlersToModel(tmModel1, this);
        const handlers3 = bindHandlersToModel(tmModel3, this);
        const handlers5 = bindHandlersToModel(tmModel5, this);
        const handlersGamma = bindHandlersToModel(tmModelGamma, this);

        return {
            tmModel1, tmModel3, tmModel5, tmModelGamma,
            handlers1, handlers3, handlers5, handlersGamma
        };
    },
    mounted() {
        console.log('demo mounted', this.tmModel);
        this.tmModel1.load(treeDataServiceDemo1.fetchHierarchyAll());
        this.tmModel3.load(treeDataServiceDemo3.fetchHierarchyAll());
        this.tmModel5.load(treeDataServiceDemo5.fetchHierarchyAll());
        //this.tmModelGamma.load(treeDataServiceGamma.fetchHierarchyAll());

        this.tmModelGamma.on('node.selected', (node) => {
            if (_.isUndefined(node.content)) {
                treeDataServiceGamma.fetchDetailsNode(node.tmid).then((result) => {
                    _.assign(node, result);
                    console.log('title', node.text);
                    console.log('content', node.content);
                    node.loadingContent = false;
                });
            }
            else {
                console.log('title', node.text);
                console.log('content', node.content);
                node.loadingContent = false;
            }
        });
    },
    components: {
        TaTree
    }
}
</script>

<style lang="scss">
@import 'assets/scss/other';
</style>
