<template>
    <v-container fluid grid-list-md>
        <mg-toolbar title="Settings" :extension="true">
            <v-spacer/>
            <v-toolbar-items>
                <v-btn text :icon="$vuetify.breakpoint.xs" @click="saveConfig">
                    <v-icon left>done</v-icon>
                    <span class="hidden-xs-only">Save Config</span>
                </v-btn>
            </v-toolbar-items>
            <template v-slot:extension>
                <v-tabs v-model="tab" align-with-title >
                <v-tabs-slider color="yellow"></v-tabs-slider>
                    <v-tab v-for="item in tabItems" :key="item.id">
                        {{ item.label }}
                    </v-tab>
                </v-tabs>
            </template>
        </mg-toolbar>

        <v-tabs-items v-model="tab" active-class="bla">
            <v-tab-item>
                <v-row>
                    <v-col cols="6">
                        <v-card>
                            <v-card-title>
                                <v-icon large left>star</v-icon>
                                Instrument Mode
                            </v-card-title>
                            <v-card-text>
                                <v-radio-group
                                    v-model="misc.instrument_mode"
                                    @change="updateConfig()"
                                    >
                                    <v-radio value="simple_three">
                                        <template v-slot:label><h3 clas="text--primary">3 Strings - ideal for beginners</h3></template>
                                    </v-radio>
                                    <div class="text--secondary ml-8">
                                        <p>This mode provides one melody, drone and trompette string.<br/>
                                        Press S1, S2, S3 to switch the drone, melody and trompette strings on / off.<br/>
                                        Press Mod1 or Mod2 to switch between presets.</p>
                                    </div>

                                    <v-radio value="simple_six">
                                        <template v-slot:label><h3 clas="text--primary">6 Strings</h3></template>
                                    </v-radio>
                                    <div class="text--secondary ml-8">
                                        <p>This mode provides six strings arranged in two groups:
                                        Group 1 contains Melody 1, Drone 1, Trompette 1;
                                        Group 2 contains Melody 2, Drone 2, Trompette 2.</p>

                                        <p> Press S1, S2, S3 to switch the drone, melody and trompette strings of the crurrent group on / off.
                                        Switch presets with short and long presses on Mod1. Switch between groups by pressing Mod2.</p>
                                    </div>

                                    <v-radio value="nine_rows">
                                        <template v-slot:label><h3 clas="text--primary">9 Strings, grouped by number</h3></template>
                                    </v-radio>
                                    <div class="text--secondary ml-8">
                                        <p>This mode provides nine strings arranged in three groups, so one extra group compared to the 6 String mode.</p>

                                        <p>Press S1, S2, S3 to switch the drone, melody and trompette strings of the crurrent group on / off.
                                        Switch between groups with short presses on Mod1 and Mod2.
                                        Switch presets with long presses on Mod1 and Mod2.</p>
                                    </div>

                                    <v-radio value="nine_cols">
                                        <template v-slot:label><h3 clas="text--primary">9 Strings, grouped by type</h3></template>
                                    </v-radio>
                                    <div class="text--secondary ml-8">
                                        <p>This mode provides nine strings, grouped by string type. One group contains all drone strings,
                                        the second all melody strings and the third all trompette strings.</p>

                                        <p>Press S1, S2, S3 to switch the first, second and third string of the current group on / off.
                                        Switch between groups with short or long presses on Mod2.
                                        Switch presets with short or long presses on Mod1.</p>
                                    </div>

                                    <v-radio value="old_mg">
                                        <template v-slot:label><h3 clas="text--primary">Old MidiGurdy Mode</h3></template>
                                    </v-radio>
                                    <div class="text--secondary ml-8">
                                        <p>This is the way the MidiGurdy worked before Version 1.3.0. Nine strings, grouped by number.</p>

                                        <p>Press S1, S2, S3 to switch the drone, melody and trompette strings of the crurrent group on / off.
                                        Hold Mod1 to select group 2, hold Mod2 to select group 3.</p>
                                    </div>
                                    <v-radio value="custom">
                                        <template v-slot:label><h3 clas="text--primary">Custom Instrument Mode</h3></template>
                                    </v-radio>
                                    <div class="text--secondary ml-8">
                                        <p>Use the form to the right to configure the strings and buttons exactly as you want them.</p>
                                    </div>
                                </v-radio-group>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="6">
                        <v-card>
                            <v-card-title :class="{'text--disabled': misc.instrument_mode !== 'custom'}">
                                Custom Instrument Mode
                            </v-card-title>
                            <v-card-text>
                                <v-radio-group
                                    label="Number of Strings"
                                    v-model="misc.features.string_count"
                                    @change="updateConfig()"
                                    :disabled="misc.instrument_mode !== 'custom'"
                                    >
                                    <v-radio label="3 Strings (1x Melody, 1x Drone, 1x Trompette)" :value="1"/>
                                    <v-radio label="6 Strings (2x Melody, 2x Drone, 2x Trompette)" :value="2"/>
                                    <v-radio label="9 Strings (3x Melody, 3x Drone, 3x Trompette)" :value="3"/>
                                </v-radio-group>

                                <v-radio-group
                                    label="String Grouping"
                                    v-model="misc.ui.string_group_by_type"
                                    @change="updateConfig()"
                                    :disabled="misc.features.string_count === 1 || misc.instrument_mode !== 'custom'"
                                    >
                                    <v-radio label="Group by String Number" :value="false"/>
                                    <v-radio label="Group by String Type" :value="true"/>
                                </v-radio-group>

                                <h4 :class="{'text--disabled': misc.instrument_mode !== 'custom'}">Mod1 Button Action</h4>
                                <v-select
                                    :items="modKeyModes"
                                    v-model="misc.ui.mod1_key_mode"
                                    @change="updateConfig()"
                                    :disabled="misc.instrument_mode !== 'custom'"
                                    outlined
                                    />

                                <h4 :class="{'text--disabled': misc.instrument_mode !== 'custom'}">Mod2 Button Action</h4>
                                <v-select
                                    :items="modKeyModes"
                                    v-model="misc.ui.mod2_key_mode"
                                    @change="updateConfig()"
                                    :disabled="misc.instrument_mode !== 'custom'"
                                    outlined
                                    />

                                <v-switch
                                    label="Wrap groups (e.g. go to first after reaching end)"
                                    v-model="misc.ui.wrap_groups"
                                    :disabled="misc.features.string_count === 1 || misc.instrument_mode !== 'custom'"
                                    @change="updateConfig()"
                                    />
                                <v-switch
                                    label="Wrap presets (e.g. go to first after reaching end)"
                                    v-model="misc.ui.wrap_presets"
                                    @change="updateConfig()"
                                    :disabled="misc.instrument_mode !== 'custom'"
                                    />
                            </v-card-text>
                        </v-card>

                    </v-col>
                </v-row>
            </v-tab-item>
            <v-tab-item>
                <v-card>
                    <v-card-title>
                        <v-icon large left>star</v-icon>
                        Features
                    </v-card-title>
                    <v-card-text>
                        <h3>Polyphonic Mode</h3>
                        <v-switch
                            label="Empty string in polyphonic mode"
                            hint="Enable this feature if you want to hear the empty string when no key is pressed in polyphonic mode"
                            persistent-hint
                            v-model="misc.features.poly_base_note"
                            @change="updateConfig()"
                            />

                        <v-switch
                            label="Pitch bend in polyphonic mode"
                            hint="Enable this feature if you want to use pitch bend in polyphonic mode"
                            persistent-hint
                            v-model="misc.features.poly_pitch_bend"
                            @change="updateConfig()"
                            />

                        <h3 class="mt-6">Chien Sensitivity</h3>
                        <v-switch
                            label="Reverse chien sensitivity direction"
                            v-model="misc.ui.chien_sens_reverse"
                            @change="updateConfig()"
                            hint="Reverses the direction you need to turn the rotary knob to increase and decrease the chien sensitivity on the instrument."
                            persistent-hint
                            />

                        <v-switch
                            label="Separate chien sensitivities"
                            hint="Enable this feature if you want to control the sensitivity of the chiens separately, disable for a single sensitivity."
                            persistent-hint
                            :disabled="misc.features.string_count === 1 || misc.instrument_mode !== 'custom'"
                            v-model="misc.ui.multi_chien_threshold"
                            @change="updateConfig()"
                            />


                    </v-card-text>
                </v-card>
            </v-tab-item>
            <v-tab-item>
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
                                    @input="misc.keyboard.key_on_debounce = check($event, 0, 50); updateConfig()"
                                    min=0
                                    max=50
                                    hint="How many milliseconds does a key need to touch the string before it is treated as pressed"
                                    persistent-hint
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.keyboard.key_on_debounce"
                                    @change="misc.keyboard.key_on_debounce = check($event, 0, 50); updateConfig()"
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
                                    @input="misc.keyboard.key_off_debounce = check($event, 0, 50); updateConfig()"
                                    min=0
                                    max=50
                                    hint="How many milliseconds does a key need to not touch the string before it is treated as not pressed"
                                    persistent-hint
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.keyboard.key_off_debounce"
                                    @change="misc.keyboard.key_off_debounce = check($event, 0, 50); updateConfig()"
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
                                    @input="misc.keyboard.base_note_delay = check($event, 0, 50); updateConfig()"
                                    min=0
                                    max=50
                                    hint="How many milliseconds to wait before returning to the string base note after all keys are released"
                                    persistent-hint
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.keyboard.base_note_delay"
                                    @change="misc.keyboard.base_note_delay = check($event, 0, 50); updateConfig()"
                                    type="number"
                                    class="number-field"
                                    suffix="ms"
                                    dense
                                    />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-tab-item>

            <v-tab-item>
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
                                    @input="misc.ui.brightness = check($event, 0, 100); updateConfig()"
                                    hint="Set this to a lower value to reduce battery consumption"
                                    persistent-hint
                                    min=0
                                    max=100
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.ui.brightness"
                                    @change="misc.ui.brightness = check($event, 0, 100); updateConfig()"
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
                                    @input="misc.ui.timeout = check($event, 0, 60); updateConfig()"
                                    hint="Controls after how many seconds of inactivity the instrument menu jumps back to the home screen. Set to 0s to never automatically return to the home screen."
                                    persistent-hint
                                    min=0
                                    max=60
                                    />
                            </v-col>
                            <v-col cols="2">
                                <v-text-field
                                    :value="misc.ui.timeout"
                                    @change="misc.ui.timeout = check($event, 0, 60); updateConfig()"
                                    type="number"
                                    class="number-field"
                                    suffix="s"
                                    dense
                                    />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-tab-item>
            <v-tab-item>
                <v-card>
                    <v-card-title>
                        <v-icon large left>dvr</v-icon>
                        Web-Interface
                    </v-card-title>
                    <v-card-text>
                        <v-switch label="Dark Theme" v-model="darkTheme" />
                    </v-card-text>
                </v-card>
            </v-tab-item>
        </v-tabs-items>
    </v-container>
</template>

<script>
import API from '@/api'
import { debounce } from 'lodash'

function data () {
    return {
        tab: 0,
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
                multi_chien_threshold: false,
                string_group_by_type: false,
                mod1_key_mode: '',
                mod2_key_mode: '',
                wrap_groups: true,
                wrap_presets: true,
            },

            features: {
                poly_base_note: true,
                poly_pitch_bend: true,
                string_count: 1,
            },

            instument_mode: 'simple_three',
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
            this.$store.dispatch('snacks/add', {
                message: 'Configuration saved',
                timeout: 2000
            })
        })
    },

    updateConfig () {
        API.setMiscConfig(this.misc).then((response) => {
            Object.assign(this.misc, response.data)
            this.$store.dispatch('setMiscConfig', response.data)
        })
    }
}

const computed = {
    tabItems () {
        return [
            {id: 'mode', label: 'Instrument Mode'},
            {id: 'features', label: 'Features'},
            {id: 'keyboard', label: 'Keyboard Timings'},
            {id: 'display', label: 'Display'},
            {id: 'web', label: 'Web Interface'},
        ]
    },

    darkTheme: {
        get () {
            return this.$store.state.ui.darkTheme
        },
        set (value) {
            this.$store.commit('uiUpdateDarkTheme', value)
        }
    },

    modKeyModes () {
        return [
            {value: 'group_preset_next', text: 'Short press: previous group, Long press: previous preset'},
            {value: 'group_preset_prev', text: 'Short press: next group, Long press: next preset'},
            {value: 'preset_next', text: 'Next preset'},
            {value: 'preset_prev', text: 'Previous preset'},
            {value: 'preset', text: 'Short press: next preset, Long press: previous preset'},
            {value: 'group_next', text: 'Next group'},
            {value: 'group_prev', text: 'Previous group'},
            {value: 'group', text: 'Short press: next group, Long press: previous group'},
            {value: 'group1', text: 'Group 2 while pressed'},
            {value: 'group2', text: 'Group 3 while pressed'},
        ]
    },
}

export default {
    data,
    methods,
    computed,

    created () {
        this.saveConfig = debounce(this.saveConfig, 250)
        this.updateConfig = debounce(this.updateConfig, 250)
        this.loadConfig()
    }
}
</script>

<style>
.theme--dark.v-tabs-items {
    background: none !important;
}
</style>
