<template>
<div>
    <mg-toolbar title="Instrument Setup">
        <v-spacer/>
        <v-toolbar-items>
            <v-btn flat :icon="$vuetify.breakpoint.xs" @click="showSelector = !showSelector">
                <v-icon left>description</v-icon>
                <span class="hidden-xs-only">Presets</span>
            </v-btn>
        </v-toolbar-items>
    </mg-toolbar>
    <v-navigation-drawer right app temporary v-model="showSelector" width="400">
        <preset-selector
            @close="showSelector = false"
            />
    </v-navigation-drawer>
    <state-edit :state="preset" @update:state="saveInstrumentState($event)"/>
</div>
</template>

<script>
import StateEdit from '@/components/state/StateEdit'
import PresetSelector from '@/components/presets/PresetSelector'
import API from '@/api'
import { debounce } from 'lodash'

function data () {
    return {
        preset: API.emptyPreset(),
        errors: {},
        showSelector: false
    }
}

const methods = {
    saveInstrumentState: debounce(function (val) {
        this.$store.dispatch('updateInstrumentState', val)
    }, 250)
}

const watch = {
    instrument (val) {
        this.preset = val
    }
}

const computed = {
    instrument () {
        return this.$store.getters.getInstrumentState
    }
}

export default {
    name: 'preset-edit',
    data,
    methods,
    watch,
    computed,
    components: {
        StateEdit,
        PresetSelector
    },

    created () {
        this.$store.dispatch('fetchInstrumentState')
    }
}
</script>
