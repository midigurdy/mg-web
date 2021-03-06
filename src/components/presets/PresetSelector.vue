<template>
    <div class="fill-height">
        <v-toolbar dark color="secondary" flat>
            <v-btn icon class="hidden-xs-only" @click="$emit('close')">
                <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Presets</v-toolbar-title>
            <v-spacer/>
            <v-toolbar-items v-if="orderMode">
                <v-btn text :icon="$vuetify.breakpoint.xs" @click.stop="orderMode = false">
                    <v-icon>done</v-icon> <span class="hidden-xs-only">Done</span>
                </v-btn>
            </v-toolbar-items>
            <v-toolbar-items v-else>
                <v-btn text :icon="$vuetify.breakpoint.xs" @click="saveNewPreset">
                    <v-icon>add</v-icon> <span class="hidden-xs-only">New</span>
                </v-btn>
                <v-btn text :icon="$vuetify.breakpoint.xs" @click="orderMode = true">
                    <v-icon>format_line_spacing</v-icon> <span class="hidden-xs-only">Order</span>
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-list v-if="presets.length">
            <vue-draggable v-model="presets" v-if="orderMode">
                <v-list-item
                    class="drag-pointer"
                    v-for="(preset, idx) in presets"
                    :key="preset.id"
                    >
                    <v-list-item-avatar>{{ idx + 1 }}</v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ preset.name || 'Unnamed' }}
                        </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-icon>reorder</v-icon>
                    </v-list-item-action>
                </v-list-item>
            </vue-draggable>
                <v-list-item
                    v-else
                    v-for="(preset, idx) in presets"
                    :key="preset.id"
                    @click="loadPreset(preset)"
                    >
                    <v-list-item-avatar>{{ idx + 1 }}</v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ preset.name || 'Unnamed' }}
                        </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                        <div>
                            <v-btn small icon @click.stop="renamePreset(preset)"
                                title="Rename the preset"
                                >
                                <v-icon color="grey">edit</v-icon>
                            </v-btn>
                            <v-btn small icon @click.stop="replacePreset(preset)"
                                title="Replace this preset with the current instrument state"
                                >
                                <v-icon color="grey">save</v-icon>
                            </v-btn>
                            <v-btn small icon @click.stop="deletePreset(preset)"
                                title="Delete this preset"
                                >
                                <v-icon color="grey">delete</v-icon>
                            </v-btn>
                        </div>
                    </v-list-item-action>
                </v-list-item>
        </v-list>
    </div>
</template>

<style scoped>
    .list__tile__action button {
        margin-left: 2px;
    }
</style>

<script>
import VueDraggable from 'vuedraggable'

function data () {
    return {
        orderMode: false,
    }
}

const computed = {
    presets: {
        get () {
            return this.$store.state.presets
        },
        set (val) {
            this.$store.dispatch('reorderPresets', val)
        }
    },

    editItems () {
        return [
            {'text': 'Replace', id: 'replace'},
            {'text': 'Delete', id: 'delete'}
        ]
    }
}

const methods = {
    loadPreset (preset) {
        this.$store.dispatch('loadPreset', preset.id).then(() => {
            this.$store.dispatch('snacks/add', {
                message: 'Preset ' + preset.number + ' loaded',
                timeout: 1000
            })
            this.$emit('close')
        })
    },

    replacePreset (preset) {
        if (!confirm('Are you sure you want to replace preset ' + preset.number + '?')) {
            return
        }
        this.$store.dispatch('replacePreset', preset.id).then(() => {
            this.$store.dispatch('snacks/add', {
                message: 'Preset ' + preset.number + ' replaced',
                timeout: 2000
            })
        })
    },

    saveNewPreset () {
        var name = prompt('Please enter a name for the new preset')
        if (name === null) {
            return
        }
        this.$store.dispatch('saveNewPreset', name).then(() => {
            this.$store.dispatch('snacks/add', {
                message: 'Preset saved',
                timeout: 2000
            })
        })
    },

    deletePreset (preset) {
        if (confirm('Are you sure you want to delete preset ' + preset.number + '?')) {
            this.$store.dispatch('removePreset', preset.id).then(() => {
                this.$store.dispatch('snacks/add', {
                    message: 'Preset deleted',
                    timeout: 1000
                })
            })
        }
    },

    renamePreset (preset) {
        var name = prompt('Please enter a new name for the new preset', preset.name)
        if (name === null) {
            return
        }
        this.$store.commit('setPresetName', {presetId: preset.id, name})
        this.$store.dispatch('savePreset', preset).then(() => {
            this.$store.dispatch('snacks/add', {
                message: 'Preset renamed',
                timeout: 2000
            })
        })
    }
}

export default {
    name: 'preset-selector',
    data,
    computed,
    methods,
    components: { VueDraggable }
}
</script>
