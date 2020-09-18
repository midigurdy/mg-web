<template>

<div>
    <mg-toolbar title="Presets">
        <v-spacer/>
        <v-toolbar-items>
            <v-btn text :icon="$vuetify.breakpoint.xs" @click="uploadDialog = true">
                <v-icon left>cloud_upload</v-icon><span class="hidden-xs-only">Import</span>
            </v-btn>
            <v-btn v-if="presets.length" text :icon="$vuetify.breakpoint.xs" :to="{name: 'presets-reorder'}">
                <v-icon>format_line_spacing</v-icon> <span class="hidden-xs-only">Reorder</span>
            </v-btn>
            <v-btn text :icon="$vuetify.breakpoint.xs" :to="{name: 'preset-edit', params: {presetId: 'new'}}">
                <v-icon>add</v-icon> <span class="hidden-xs-only">Add Preset</span>
            </v-btn>
        </v-toolbar-items>
    </mg-toolbar>

    <div class="row">
        <div v-if="presets.length" class="col-sm-12">
            <v-list two-line>
                <template v-for="(preset, idx) in presets">
                <v-list-tile avatar :key="preset.id" :to="{name: 'preset-edit', params: {presetId: preset.id}}">
                    <v-list-tile-avatar>
                        {{ idx + 1 }}
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                    <v-list-tile-title>{{ preset.name || 'Unnamed' }}</v-list-tile-title>
                        <v-list-tile-sub-title>
                            <span class="summary-entry" v-for="entry in presetSummary(preset)" :key="entry">
                                {{ entry }}
                            </span>
                        </v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon ripple title="Load preset" @click.prevent="loadPreset(preset)">
                            <v-icon color="grey">open_in_browser</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
                </template>
            </v-list>
        </div>
        <div v-else class="col-sm-12">
            No presets defined
        </div>
    </div>

    <preset-upload :show.sync="uploadDialog"/>
</div>

</template>

<style scoped>
    .summary-entry {
        margin-right: 1em;
    }
</style>

<script>
import MidiFilters from '@/mixins/midifilters'
import PresetUpload from '@/components/presets/Upload'

function data () {
    return {
        uploadDialog: false
    }
}

const computed = {
    presets () {
        return this.$store.state.presets
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

    loadPreset (preset) {
        this.$store.dispatch('loadPreset', preset.id).then(() => {
            this.$store.dispatch('snacks/add', {
                message: 'Preset ' + preset.number + ' loaded',
                timeout: 1000
            })
        })
    }
}

export default {
    name: 'preset-list',
    data,
    computed,
    methods,
    components: {
        'preset-upload': PresetUpload
    }
}
</script>
