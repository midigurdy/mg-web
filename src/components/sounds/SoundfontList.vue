<template>
<v-container flex>
    <mg-toolbar title="Sounds">
        <v-spacer/>
        <v-toolbar-items>
            <v-btn text :icon="$vuetify.breakpoint.xs" @click="uploadDialog = true">
                <v-icon left>cloud_upload</v-icon><span class="hidden-xs-only">Add Sound</span>
            </v-btn>
        </v-toolbar-items>
    </mg-toolbar>

    <v-list two-line>
        <template v-if="soundfonts.length">
        <div v-for="(set, index) in soundfonts" :key="index">
            <v-list-item :to="{name: 'soundfont-details', params: {soundfontId: set.id}}">
                <v-list-item-avatar :color="(set.mode == 'midigurdy') ? 'primary' : 'grey'">
                <span class="white--text">{{ set.mode == 'midigurdy' ? 'MG' : 'G' }}</span> 
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title>{{ set.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ set.description }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                    <v-list-item-action-text class="text--primary">{{ set.sounds.length }} Sounds</v-list-item-action-text>
                    <v-list-item-action-text>{{set.filename }}</v-list-item-action-text>
                    <v-list-item-action-text>{{ set.filesize | humanizedSize }}</v-list-item-action-text>
                </v-list-item-action>
            </v-list-item>
            <v-divider v-if="index + 1 < soundfonts.length"></v-divider>
        </div>
        </template>
        <v-list-item v-else>
            <v-list-item-content>
                <v-list-item-title>No Sounds available</v-list-item-title>
                <v-list-item-subtitle>Use the "Add Sounds" function to uploads sounds to the Instrument.</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
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
