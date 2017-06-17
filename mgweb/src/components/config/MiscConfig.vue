<template>
<v-container fluid grid-list-md>
    <mg-toolbar title="Settings">
        <v-spacer/>
        <v-toolbar-items>
            <v-btn flat :icon="$vuetify.breakpoint.xs" @click="saveConfig">
                <v-icon left>done</v-icon>
                <span class="hidden-xs-only">Save Config</span>
            </v-btn>
        </v-toolbar-items>
    </mg-toolbar>

        <v-layout row wrap>
            <v-flex md6>
                <v-card>
                <v-card-title><h2><v-icon left>settings_brightness</v-icon> Instrument User-Interface</h2></v-card-title>
                    <v-card-text>
                        <v-layout row wrap>
                            <v-flex xs10>
                                <v-slider
                                    label="Display Brightness"
                                    :value="misc.ui.brightness"
                                    @input="misc.ui.brightness = check($event, 0, 100)"
                                    min=0
                                    max=100
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.ui.brightness"
                                    @change="misc.ui.brightness = check($event, 0, 100)"
                                    type="number"/>
                            </v-flex>
                            <v-flex xs10>
                                <v-slider
                                    label="Display Timeout"
                                    :value="misc.ui.timeout"
                                    @input="misc.ui.timeout = check($event, 0, 60)"
                                    min=0
                                    max=60
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.ui.timeout"
                                    @change="misc.ui.timeout = check($event, 0, 60)"
                                    type="number"/>
                            </v-flex>
                            <v-flex xs12>
                                <v-switch
                                    label="Reverse Chien Sensitivity Direction"
                                    v-model="misc.ui.chien_sens_reverse"
                                    />
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex md6>
                <v-card>
                    <v-card-title><h2><v-icon left>timer</v-icon> Keyboard Debounce Delays</h2></v-card-title>
                    <v-card-text>
                        <v-layout row wrap>
                            <v-flex xs10>
                                <v-slider
                                    label="Key-On Delay"
                                    :value="misc.keyboard.key_on_debounce"
                                    @input="misc.keyboard.key_on_debounce = check($event, 0, 50)"
                                    min=0
                                    max=50
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.keyboard.key_on_debounce"
                                    @change="misc.keyboard.key_on_debounce = check($event, 0, 50)"
                                    type="number"/>
                            </v-flex>
                            <v-flex xs10>
                                <v-slider
                                    label="Key-Off Delay"
                                    :value="misc.keyboard.key_off_debounce"
                                    @input="misc.keyboard.key_off_debounce = check($event, 0, 50)"
                                    min=0
                                    max=50
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.keyboard.key_off_debounce"
                                    @change="misc.keyboard.key_off_debounce = check($event, 0, 50)"
                                    type="number"/>
                            </v-flex>
                            <v-flex xs10>
                                <v-slider
                                    label="Open String Delay"
                                    :value="misc.keyboard.base_note_delay"
                                    @input="misc.keyboard.base_note_delay = check($event, 0, 50)"
                                    min=0
                                    max=50
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.keyboard.base_note_delay"
                                    @change="misc.keyboard.base_note_delay = check($event, 0, 50)"
                                    type="number"/>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
</v-container>
</template>

<script>
import API from '@/api'

function data () {
    return {
        misc: {
            keyboard: {
                key_on_debounce: 0,
                key_off_debounce: 0,
                base_note_delay: 0
            },

            ui: {
                timeout: 0,
                brightness: 0,
                chien_sens_reverse: false
            }
        }
    }
}

const methods = {

    check (val, min, max) {
        if (val === undefined || val === null) return min
        return Math.max(min, Math.min(max, val))
    },

    loadConfig () {
        API.getMiscConfig().then((response) => {
            Object.assign(this.misc, response.data)
        })
    },

    saveConfig () {
        API.saveMiscConfig(this.misc).then((response) => {
            Object.assign(this.misc, response.data)
            this.$store.dispatch('snacks/add', {
                message: 'Configuration saved',
                timeout: 2000
            })
        })
    }
}

export default {
    data,
    methods,

    created () {
        this.loadConfig()
    }
}
</script>
