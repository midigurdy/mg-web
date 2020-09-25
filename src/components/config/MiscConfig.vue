<template>
<v-container fluid grid-list-md>
    <mg-toolbar title="Settings" />

        <v-row align="stretch">
            <v-col cols="6">
                <v-card>
                    <v-card-title>
                        <v-icon large left>settings_brightness</v-icon>
                        Instrument User-Interface
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="10">
                                <v-slider
                                    label="Display Brightness"
                                    :value="misc.ui.brightness"
                                    @input="misc.ui.brightness = check($event, 0, 100); saveConfig()"
                                    hint="Set this to a lower value to reduce battery consumption"
                                    persistent-hint
                                    min=0
                                    max=100
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.ui.brightness"
                                    @change="misc.ui.brightness = check($event, 0, 100); saveConfig()"
                                    type="number"
                                    class="number-field"
                                    suffix="%"
                                    dense
                                    />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="10">
                                <v-slider
                                    label="Display Timeout"
                                    :value="misc.ui.timeout"
                                    @input="misc.ui.timeout = check($event, 0, 60); saveConfig()"
                                    hint="Controls after how many seconds of inactivity the instrument menu jumps back to the home screen"
                                    persistent-hint
                                    min=0
                                    max=60
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.ui.timeout"
                                    @change="misc.ui.timeout = check($event, 0, 60); saveConfig()"
                                    type="number"
                                    class="number-field"
                                    suffix="s"
                                    dense
                                    />
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col>
                                <v-switch
                                    label="Reverse Chien Sensitivity Direction"
                                    v-model="misc.ui.chien_sens_reverse"
                                    @change="saveConfig()"
                                    hint="Reverses the direction you need to turn the rotary knob to increase and decrease the chien sensitivity on the instrument."
                                    persistent-hint
                                    />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card>
                    <v-card-title>
                        <v-icon large left>timer</v-icon>
                        Keyboard Debounce Delays
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="10">
                                <v-slider
                                    label="Key-On Delay"
                                    :value="misc.keyboard.key_on_debounce"
                                    @input="misc.keyboard.key_on_debounce = check($event, 0, 50); saveConfig()"
                                    min=0
                                    max=50
                                    hint="How many milliseconds does a key need to touch the string before it is treated as pressed"
                                    persistent-hint
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.keyboard.key_on_debounce"
                                    @change="misc.keyboard.key_on_debounce = check($event, 0, 50); saveConfig()"
                                    type="number"
                                    class="number-field"
                                    suffix="ms"
                                    dense
                                    />
                            </v-col>
                            <v-col cols="10">
                                <v-slider
                                    label="Key-Off Delay"
                                    :value="misc.keyboard.key_off_debounce"
                                    @input="misc.keyboard.key_off_debounce = check($event, 0, 50); saveConfig()"
                                    min=0
                                    max=50
                                    hint="How many milliseconds does a key need to not touch the string before it is treated as not pressed"
                                    persistent-hint
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.keyboard.key_off_debounce"
                                    @change="misc.keyboard.key_off_debounce = check($event, 0, 50); saveConfig()"
                                    type="number"
                                    class="number-field"
                                    suffix="ms"
                                    dense
                                    />
                            </v-col>
                            <v-col cols="10">
                                <v-slider
                                    label="Open String Delay"
                                    :value="misc.keyboard.base_note_delay"
                                    @input="misc.keyboard.base_note_delay = check($event, 0, 50); saveConfig()"
                                    min=0
                                    max=50
                                    hint="How many milliseconds to wait before returning to the string base note after all keys are released"
                                    persistent-hint
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.keyboard.base_note_delay"
                                    @change="misc.keyboard.base_note_delay = check($event, 0, 50); saveConfig()"
                                    type="number"
                                    class="number-field"
                                    suffix="ms"
                                    dense
                                    />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            </v-row>
            <v-row>
            <v-col cols="6">
                <v-card>
                    <v-card-title>
                        <v-icon large left>dvr</v-icon>
                        Web-Interface
                    </v-card-title>
                    <v-card-text>
                        <v-switch label="Dark Theme" v-model="darkTheme" />
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card>
                    <v-card-title>
                        <v-icon large left>star</v-icon>
                        Features
                    </v-card-title>
                    <v-card-text>
                        <h4>Number of Strings</h4>
                        <v-switch
                            label="Multiple Strings"
                            hint=""
                            persistent-hint
                            v-model="misc.features.multi_strings"
                            @change="saveConfig()"
                            />
                        <v-switch
                            label="Separate chien sensitivities"
                            hint="Enable this feature if you want to control the sensitivity of the three chiens separately, disable for a single sensitivity."
                            persistent-hint
                            :disabled="!misc.features.multi_strings"
                            v-model="misc.ui.multi_chien_threshold"
                            @change="saveConfig()"
                            />

                    </v-card-text>
                    <v-card-text>
                        <h4>Polyphonic Mode</h4>
                        <v-switch
                            label="Empty string in polyphonic mode"
                            hint="Enable this feature if you want to hear the empty string when no key is pressed in polyphonic mode"
                            persistent-hint
                            v-model="misc.features.poly_base_note"
                            @change="saveConfig()"
                            />

                        <v-switch
                            label="Pitch bend in polyphonic mode"
                            hint="Enable this feature if you want to use pitch bend in polyphonic mode"
                            persistent-hint
                            v-model="misc.features.poly_pitch_bend"
                            @change="saveConfig()"
                            />

                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
</v-container>
</template>

<script>
import API from '@/api'
import { debounce } from 'lodash'

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
            },

            features: {
                poly_base_note: true,
                poly_pitch_bend: true,
                multi_strings: true,
            },
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
            this.$store.dispatch('setMiscConfig', response.data)
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
        this.saveConfig = debounce(this.saveConfig, 250)
        this.loadConfig()
    }
}
</script>
