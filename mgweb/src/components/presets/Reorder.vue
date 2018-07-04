<template>
<div>
    <mg-toolbar title="Reorder">
        <v-btn slot="icon" icon :to="{name: 'preset-list'}" exact>
            <v-icon>arrow_back</v-icon>
        </v-btn>

        <v-spacer/>
        <v-toolbar-items>
            <v-btn flat :icon="$vuetify.breakpoint.xs" @click.stop="saveOrder">
                <v-icon>done</v-icon> <span class="hidden-xs-only">Save</span>
            </v-btn>
        </v-toolbar-items>
    </mg-toolbar>

    <v-list>
        <draggable v-model="presets" v-if="presets.length" :options="{handle: '.list__tile__action'}">
            <v-list-tile v-for="preset in presets" :key="preset.id">
                <v-list-tile-action>
                    <v-icon class="drag-pointer" color="pink">reorder</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>
                        {{ preset.number }} - {{ preset.name || 'Unnamed' }}
                    </v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </draggable>
    </v-list>
</div>
</template>

<script>
import VueDraggable from 'vuedraggable'

function data () {
    return {
        presets: []
    }
}

const watch = {
    storePresets (presets) {
        this.presets = presets
    }
}

const computed = {
    storePresets () {
        return this.$store.getters.getPresets.map((preset, idx) => {
            return {
                id: preset.id,
                name: preset.name,
                number: idx + 1
            }
        })
    }
}

const methods = {
    saveOrder () {
        this.$store.dispatch('reorderPresets', this.presets)
        .then(() => {
            this.$router.push({name: 'preset-list'})
        })
    }
}

export default {
    name: 'presets-reorder',
    components: {
        'draggable': VueDraggable
    },
    computed,
    data,
    methods,
    watch,
    created () {
        this.presets = this.storePresets
    }
}
</script>

<style>
.sortable-drag {
    background-color: #eee;
}
.drag-pointer {
    cursor: move;
}
</style>
