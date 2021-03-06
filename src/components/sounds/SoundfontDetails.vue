<template>
<div>
    <mg-toolbar :title="soundfont.name">
        <template v-slot:icon>
            <v-app-bar-nav-icon :to="{name: 'soundfont-list'}" exact>
                <v-icon>arrow_back</v-icon>
            </v-app-bar-nav-icon>
        </template>
        <v-spacer/>
        <v-toolbar-items>
            <v-btn text :icon="$vuetify.breakpoint.xs" :href="'/download/sounds/' + soundfont.filename">
               <v-icon left>cloud_download</v-icon><span class="hidden-xs-only">Download</span>
            </v-btn>
            <v-btn text :icon="$vuetify.breakpoint.xs" @click="deleteSoundfont">
               <v-icon left>delete</v-icon><span class="hidden-xs-only">Delete</span>
            </v-btn>
        </v-toolbar-items>
    </mg-toolbar>

    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text>
                        <v-container fluid grid-list-sm>
                            <div class="layout row" v-if="soundfont.description">
                                <div class="flex xs2">
                                    Description
                                </div>
                                <div class="flex xs10">
                                    {{ soundfont.description }}
                                </div>
                            </div>
                            <div class="layout row" v-if="soundfont.copyright">
                                <div class="flex xs2">
                                    Copyright
                                </div>
                                <div class="flex xs10">
                                    {{ soundfont.copyright }}
                                </div>
                            </div>
                            <div class="layout row" v-if="soundfont.author">
                                <div class="flex xs2">
                                    Author
                                </div>
                                <div class="flex xs10">
                                    {{ soundfont.author }}
                                </div>
                            </div>
                        </v-container>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Sounds</v-card-title>
                    <v-simple-table>
                        <template v-slot:default>
                            <thead style="text-align: left">
                                <tr>
                                    <th>Type</th>
                                    <th>Name</th>
                                    <th>Base Note</th>
                                    <th>Bank/Prog</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="sound in soundfont.sounds" :key="sound.id">
                                    <td style="width: 1%">
                                        <v-avatar
                                            size="30"
                                            :color="(sound.type === 'generic') ? 'grey' : 'primary'"
                                            class="white--text"
                                            :title="sound.type | capfirst">
                                                {{ sound | soundType }}
                                        </v-avatar>
                                    </td>
                                    <td>{{ sound.name }}</td>
                                    <td>{{ sound.note | midiNote }}</td>
                                    <td>{{ sound.bank }}:{{ sound.program }}</td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</div>
</template>

<script>
import MidiFilters from '@/mixins/midifilters'

function data () {
    return {
        loading: true,

        test: null,

        soundfont: {
            name: 'Loading ...',
            description: '',
            hidden: false,
            type: '',
            sounds: []
        }
    }
}

const watch = {
    '$route' () {
        this.loadSoundfont()
    }
}

const computed = {
}

const methods = {
    loadSoundfont () {
        var id = this.$route.params.soundfontId
        if (!id) return
        var fonts = this.$store.getters.sortedSoundFonts
        this.soundfont = fonts.find(el => el.id === id) || {}
    },

    deleteSoundfont () {
        if (confirm('Are you sure you want to delete this Soundfont?')) {
            this.$store.dispatch('removeSoundFont', this.soundfont.id).then(() => {
                this.$store.dispatch('snacks/add', {message: 'Soundfont deleted'})
                this.$router.push({name: 'soundfont-list'})
            })
        }
    }
}

export default {
    name: 'soundfont-details',
    data,
    computed,
    methods,
    watch,
    mixins: [MidiFilters],
    created () {
        this.loadSoundfont()
    }
}
</script>
