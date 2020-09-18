<template>
<v-container flex>
    <mg-toolbar title="Sounds">
        <v-spacer/>
        <v-toolbar-items>
            <v-btn flat :icon="$vuetify.breakpoint.xs" @click="uploadDialog = true">
                <v-icon left>cloud_upload</v-icon><span class="hidden-xs-only">Add Sound</span>
            </v-btn>
        </v-toolbar-items>
    </mg-toolbar>

    <v-list two-line>
        <template v-if="soundfonts.length">
        <div v-for="(set, index) in soundfonts" :key="set.id">
            <v-list-tile avatar :to="{name: 'soundfont-details', params: {soundfontId: set.id}}">
                <v-list-tile-avatar :color="(set.mode == 'midigurdy') ? 'primary' : 'grey'">
                <span class="white--text">{{ set.mode == 'midigurdy' ? 'MG' : 'G' }}</span> 
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title>{{ set.name }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{ set.description }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <v-list-tile-action-text class="text--primary">{{ set.sounds.length }} Sounds</v-list-tile-action-text>
                    <v-list-tile-action-text>{{set.filename }}</v-list-tile-action-text>
                    <v-list-tile-action-text>{{ set.filesize | humanizedSize }}</v-list-tile-action-text>
                </v-list-tile-action>
            </v-list-tile>
            <v-divider v-if="index + 1 < soundfonts.length" :key="index"></v-divider>
        </div>
        </template>
        <v-list-tile v-else>
            <v-list-tile-content>
                <v-list-tile-title>No Sounds available</v-list-tile-title>
                <v-list-tile-sub-title>Use the "Add Sounds" function to uploads sounds to the Instrument.</v-list-tile-sub-title>
            </v-list-tile-content>
        </v-list-tile>
    </v-list>

    <soundfont-upload :show.sync="uploadDialog"/>

</v-container>
</template>

<style scoped>
</style>

<script>
import MidiFilters from '@/mixins/midifilters'
import SoundfontUpload from '@/components/sounds/Upload'

function data () {
    return {
        uploadDialog: false
    }
}

const methods = {
}

const computed = {
    soundfonts () {
        return this.$store.getters.sortedSoundFonts
    }
}

export default {
    name: 'soundfont-list',
    computed,
    methods,
    data,
    mixins: [MidiFilters],
    components: {
        'soundfont-upload': SoundfontUpload
    },
    created () {
        this.$store.dispatch('fetchSoundFonts')
    }
}
</script>
