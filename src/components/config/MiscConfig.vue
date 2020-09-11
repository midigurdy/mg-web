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
                                    hint="Set this to a lower value to reduce battery consumption"
                                    persistent-hint
                                    min=0
                                    max=100
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.ui.brightness"
                                    @change="misc.ui.brightness = check($event, 0, 100)"
                                    type="number"
                                    suffix="%"
                                    />
                            </v-flex>
                            <v-flex xs10>
                                <v-slider
                                    label="Display Timeout"
                                    :value="misc.ui.timeout"
                                    @input="misc.ui.timeout = check($event, 0, 60)"
                                    hint="Controls after how many seconds of inactivity the instrument menu jumps back to the home screen"
                                    persistent-hint
                                    min=0
                                    max=60
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.ui.timeout"
                                    @change="misc.ui.timeout = check($event, 0, 60)"
                                    type="number"
                                    suffix="s"
                                    />
                            </v-flex>
                            <v-flex xs12 mt-3>
                                <v-switch
                                    label="Reverse Chien Sensitivity Direction"
                                    v-model="misc.ui.chien_sens_reverse"
                                    hint="Reverses the direction you need to turn the rotary knob to increase and decrease the chien sensitivity on the instrument."
                                    persistent-hint
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
                                    hint="How many milliseconds does a key need to touch the string before it is treated as pressed"
                                    persistent-hint
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.keyboard.key_on_debounce"
                                    @change="misc.keyboard.key_on_debounce = check($event, 0, 50)"
                                    type="number"
                                    suffix="ms"
                                    />
                            </v-flex>
                            <v-flex xs10>
                                <v-slider
                                    label="Key-Off Delay"
                                    :value="misc.keyboard.key_off_debounce"
                                    @input="misc.keyboard.key_off_debounce = check($event, 0, 50)"
                                    min=0
                                    max=50
                                    hint="How many milliseconds does a key need to not touch the string before it is treated as not pressed"
                                    persistent-hint
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.keyboard.key_off_debounce"
                                    @change="misc.keyboard.key_off_debounce = check($event, 0, 50)"
                                    type="number"
                                    suffix="ms"
                                    />
                            </v-flex>
                            <v-flex xs10>
                                <v-slider
                                    label="Open String Delay"
                                    :value="misc.keyboard.base_note_delay"
                                    @input="misc.keyboard.base_note_delay = check($event, 0, 50)"
                                    min=0
                                    max=50
                                    hint="How many milliseconds to wait before returning to the string base note after all keys are released"
                                    persistent-hint
                                    />
                            </v-flex>
                            <v-flex xs2>
                                <v-text-field
                                    :value="misc.keyboard.base_note_delay"
                                    @change="misc.keyboard.base_note_delay = check($event, 0, 50)"
                                    type="number"
                                    suffix="ms"
                                    />
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex md6>
                <v-card>
                    <v-card-title><h2><v-icon left>dvr</v-icon> Web-Interface</h2></v-card-title>
                    <v-card-text>
                        <v-layout row wrap>
                            <v-flex xs12>
                                <v-switch label="Dark Theme" v-model="darkTheme" />
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex md6>
                <v-card>
                    <v-card-title><h2><v-icon left>star</v-icon> Features</h2></v-card-title>
                    <v-card-text>
                        <v-layout row wrap>
                            <v-flex xs12>
                                <v-switch
                                    label="Separate chien sensitivities"
                                    hint="Enable this feature if you want to control the sensitivity of the three chiens separately, disable for a single sensitivity."
                                    persistent-hint
                                    v-model="misc.ui.multi_chien_threshold" />
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
                chien_sens_reverse: false,
                multi_chien_threshold: false
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
            this.$store.dispatch('fetchMiscConfig')
            this.$store.dispatch('snacks/add', {
                message: 'Configuration saved',
                timeout: 2000
            })
        })
    }
}

const computed = {
    darkTheme: {
        get () {
            return this.$store.state.ui.darkTheme
        },
        set (value) {
            this.$store.commit('uiUpdateDarkTheme', value)
        }
    }
}

export default {
    data,
    methods,
    computed,

    created () {
        this.loadConfig()
    }
}
</script>
