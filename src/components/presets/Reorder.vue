<template>
<v-container>
    <mg-toolbar title="Reorder">
        <template v-slot:icon>
            <v-app-bar-nav-icon :to="{name: 'preset-list'}" exact>
                <v-icon>arrow_back</v-icon>
            </v-app-bar-nav-icon>
        </template>

        <v-spacer/>
        <v-toolbar-items>
            <v-btn text :icon="$vuetify.breakpoint.xs" @click.stop="saveOrder">
                <v-icon>done</v-icon> <span class="hidden-xs-only">Save</span>
            </v-btn>
        </v-toolbar-items>
    </mg-toolbar>

    <v-list two-line v-if="presets.length">
        <draggable v-model="presets">
            <div v-for="(preset, idx) in presets" :key="preset.id">
                <v-list-item class="drag-pointer">
                    <v-list-item-avatar>
                        {{ idx + 1 }}
                    </v-list-item-avatar>
                    <v-list-item-content>
                    <v-list-item-title>{{ preset.name || 'Unnamed' }}</v-list-item-title>
                        <v-list-item-subtitle>
                            <span class="mr-4" v-for="entry in presetSummary(preset)" :key="entry">
                                {{ entry }}
                            </span>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-icon>reorder</v-icon>
                    </v-list-item-action>
                </v-list-item>
                <v-divider />
            </div>
        </draggable>
    </v-list>
</v-container>
</template>

<script>
import VueDraggable from 'vuedraggable'
import MidiFilters from '@/mixins/midifilters'

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
                number: idx + 1,
                voices: preset.voices,
            }
        })
    }
}

const methods = {
    presetSummary (preset) {
        var voices = ['melody', 'drone', 'trompette']
        var summary = []
        voices.forEach(name => {
            var notes = (preset.voices[name] || [])
                .filter(el => el.soundfont)
                .map(el => MidiFilters.filters.midiBaseNote(el.note))
            if (notes.length) {
                summary.push(MidiFilters.filters.capfirst(name) + ': ' + notes.join(', '))
            }
        })
        return summary
    },

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
