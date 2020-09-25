<template>
<v-container fluid class="grid-list-md" :class="{'grid-list-xs': $vuetify.breakpoint.xs}">
    <v-layout wrap>
        <v-flex xs12 v-if="showName">
            <v-card>
                <v-card-text>
                    <v-text-field :value="preset.name" @change="preset.name = $event; stateChanged()" label="Name"/>
                </v-card-text>
            </v-card>
        </v-flex>

        <v-flex md6 class="mixer-panel">
            <v-card>
                <v-card-title class="font-weight-bold">
                    <v-icon left>tune</v-icon> Mixer
                </v-card-title>
                <v-container fluid grid-list>
                    <voice-mixer title="Main Volume"
                        :volume="preset.main.volume"
                        @update:volume="preset.main.volume = $event; stateChanged()"
                        />

                    <div class="layout row wrap" id="mixer-heading">
                        <div class="flex xs3">Strings</div>
                        <div class="flex xs4">Volume %</div>
                        <div class="flex xs1"></div>
                        <div class="flex xs3">L - Balance - R</div>
                        <div class="flex xs1"></div>
                    </div>

                    <voice-mixer
                        v-for="(voice, index) in melodyVoices"
                        :key="'m' + index"
                        :title="multiStrings ? 'Melody ' + (index + 1) : 'Melody'"
                        :volume="voice.volume"
                        @update:volume="voice.volume = $event; stateChanged()"
                        :balance="voice.panning"
                        @update:balance="voice.panning = $event; stateChanged()"
                        :muted="voice.muted"
                        @update:muted="voice.muted = $event; stateChanged()"
                        :showBalance="true"
                        :disabled="!hasSound(voice)"
                        :showMute="true" />
                    <voice-mixer
                        v-for="(voice, index) in droneVoices"
                        :key="'d' + index"
                        :title="multiStrings ? 'Drone ' + (index + 1) : 'Drone'"
                        :volume="voice.volume"
                        @update:volume="voice.volume = $event; stateChanged()"
                        :balance="voice.panning"
                        @update:balance="voice.panning = $event; stateChanged()"
                        :muted="voice.muted"
                        @update:muted="voice.muted = $event; stateChanged()"
                        :disabled="!hasSound(voice)"
                        :showBalance="true"
                        :showMute="true" />
                    <voice-mixer
                        v-for="(voice, index) in trompetteVoices"
                        :key="'t' + index"
                        :title="multiStrings ? 'Tromp. ' + (index + 1) : 'Tromp.'"
                        :volume="voice.volume"
                        @update:volume="voice.volume = $event; stateChanged()"
                        :balance="voice.panning"
                        @update:balance="voice.panning = $event; stateChanged()"
                        :muted="voice.muted"
                        @update:muted="voice.muted = $event; stateChanged()"
                        :disabled="!hasSound(voice)"
                        :showBalance="true"
                        :showMute="true" />

                    <div class="layout row wrap" id="mixer-heading">
                        <div class="flex xs3">Effects</div>
                        <div class="flex xs4">Volume %</div>
                        <div class="flex xs1"></div>
                        <div class="flex xs3">L - Balance - R</div>
                        <div class="flex xs1"></div>
                    </div>
                    <voice-mixer title="Key Noise"
                        :showBalance="true"
                        :volume="preset.keynoise.volume"
                        @update:volume="preset.keynoise.volume = $event; stateChanged()"
                        :balance="preset.keynoise.panning"
                        @update:balance="preset.keynoise.panning = $event; stateChanged()"
                        :disabled="!preset.keynoise.soundfont"
                        />
                    <voice-mixer title="Reverb"
                        :showBalance="true"
                        :volume="preset.reverb.volume"
                        @update:volume="preset.reverb.volume = $event; stateChanged()"
                        :balance="preset.reverb.panning"
                        @update:balance="preset.reverb.panning = $event; stateChanged()"
                        />
                    <voice-mixer title="Synth Gain"
                        :showBalance="false"
                        :volume="preset.main.gain"
                        @update:volume="preset.main.gain = $event; stateChanged()"
                        />
                </v-container>
            </v-card>
        </v-flex>
        <v-flex md6>
            <v-layout row wrap>
                <v-flex xs12>
            <v-card>
                <v-card-title class="font-weight-bold">
                    <v-icon left>queue_music</v-icon> String Setup
                </v-card-title>
                <v-card-text>
                    <voice-edit
                        v-for="(voice, index) in melodyVoices"
                        :key="'vm' + index"
                        :soundfont="voice.soundfont"
                        @update:soundfont="soundfontChanged($event, voice)"
                        :bank="voice.bank"
                        @update:bank="voice.bank = $event; stateChanged()"
                        :program="voice.program"
                        @update:program="voice.program = $event; stateChanged()"
                        :note="voice.note"
                        @update:note="voice.note = $event; stateChanged()"
                        :mode="voice.mode"
                        @update:mode="voice.mode = $event; stateChanged()"
                        :capo="voice.capo"
                        @update:capo="voice.capo = $event; stateChanged()"
                        :polyphonic="voice.polyphonic"
                        @update:polyphonic="voice.polyphonic = $event; stateChanged()"
                        :finetune="voice.finetune"
                        @update:finetune="voice.finetune = $event; stateChanged()"
                        type="melody"
                        label="Melody"
                        :number="multiStrings ? index + 1 : ''"/>
                
                    <voice-edit
                        v-for="(voice, index) in droneVoices"
                        :key="'vd' + index"
                        :soundfont="voice.soundfont"
                        @update:soundfont="soundfontChanged($event, voice)"
                        :bank="voice.bank"
                        @update:bank="voice.bank = $event; stateChanged()"
                        :program="voice.program"
                        @update:program="voice.program = $event; stateChanged()"
                        :note="voice.note"
                        @update:note="voice.note = $event; stateChanged()"
                        :mode="voice.mode"
                        @update:mode="voice.mode = $event; stateChanged()"
                        :capo="voice.capo"
                        @update:capo="voice.capo = $event; stateChanged()"
                        :polyphonic="voice.polyphonic"
                        @update:polyhonic="voice.polyphonic = $event; stateChanged()"
                        :finetune="voice.finetune"
                        @update:finetune="voice.finetune = $event; stateChanged()"
                        type="drone"
                        label="Drone"
                        :number="multiStrings ? index + 1 : ''"/>

                    <voice-edit
                        v-for="(voice, index) in trompetteVoices"
                        :key="'vc' + index"
                        :soundfont="voice.soundfont"
                        @update:soundfont="soundfontChanged($event, voice)"
                        :bank="voice.bank"
                        @update:bank="voice.bank = $event; stateChanged()"
                        :program="voice.program"
                        @update:program="voice.program = $event; stateChanged()"
                        :note="voice.note"
                        @update:note="voice.note = $event; stateChanged()"
                        :mode="voice.mode"
                        @update:mode="voice.mode = $event; stateChanged()"
                        :capo="voice.capo"
                        @update:capo="voice.capo = $event; stateChanged()"
                        :polyphonic="voice.polyphonic"
                        @update:polyhonic="voice.polyphonic = $event; stateChanged()"
                        :finetune="voice.finetune"
                        @update:finetune="voice.finetune = $event; stateChanged()"
                        type="trompette"
                        label="Trompette"
                        :number="multiStrings ? index + 1 : ''"/>
                </v-card-text>
            </v-card>
        </v-flex>
        <v-flex xs12>
            <v-card>
                <v-card-title class="font-weight-bold">
                    <v-icon left>pets</v-icon> Chien Sensitivity
                </v-card-title>
                <v-card-text>
                    <template v-if="multiChienThreshold">
                        <chien-config
                            v-for="(voice, index) in preset.voices.trompette"
                            :key="'cth' + index"
                            :title="'Chien ' + (index + 1)"
                            :sensitivity="voice.chien_threshold"
                            @update:sensitivity="voice.chien_threshold = $event; stateChanged()"
                            />
                    </template>
                    <template v-else>
                        <chien-config
                            title="Sensitivity"
                            :sensitivity="preset.voices.trompette[0].chien_threshold"
                            @update:sensitivity="preset.voices.trompette[0].chien_threshold = $event; stateChanged()"
                            />
                    </template>
                </v-card-text>
            </v-card>
        </v-flex>
        <v-flex xs12>
            <tuning-config
                :coarse="preset.tuning.coarse"
                @update:coarse="preset.tuning.coarse = $event; stateChanged()"
                :fine.sync="preset.tuning.fine"
                @update:fine="preset.tuning.fine = $event; stateChanged()"
                :pitchbend_range="preset.main.pitchbend_range"
                @update:pitchbend_range="preset.main.pitchbend_range = $event; stateChanged()"
                />
        </v-flex>
        <v-flex xs12>
            <effect-config
                :keynoiseSoundfont="preset.keynoise.soundfont"
                @update:keynoiseSoundfont="preset.keynoise.soundfont = $event; stateChanged();"
                :keynoiseBank="preset.keynoise.bank"
                @update:keynoiseBank="preset.keynoise.bank = $event; stateChanged()"
                :keynoiseProgram="preset.keynoise.program"
                @update:keynoiseProgram="preset.keynoise.program = $event; stateChanged()"
                />
        </v-flex>
        </v-layout>
        </v-flex>
    </v-layout>
</v-container>
</template>

<style scoped>
#mixer-heading div {
    font-size: 100%;
    text-align: center;
    margin-bottom: 1em;
}

#mixer-heading div:first-child {
    text-align: left;
    font-weight: bold;
}

.voice-disabled {
    opacity: 0.5;
}

.mixer-panel label {
    font-weight: normal;
}
</style>

<script>
import VoiceEdit from '@/components/voices/Edit'
import VoiceMixer from '@/components/voices/VoiceMixer'
import TuningConfig from '@/components/state/TuningConfig'
import EffectConfig from '@/components/state/EffectConfig'
import ChienConfig from '@/components/state/ChienConfig'
import API from '@/api'

function data () {
    return {
        preset: API.emptyPreset()
    }
}

const watch = {
    state (val) {
        this.preset = val
    }
}

const computed = {
    multiChienThreshold () {
        return this.$store.getters.multiChienThreshold
    },

    multiStrings () {
        return this.$store.getters.multiStrings
    },

    melodyVoices () {
        return  this.multiStrings ? this.preset.voices.melody : [this.preset.voices.melody[0]]
    },

    droneVoices () {
        return  this.multiStrings ? this.preset.voices.drone : [this.preset.voices.drone[0]]
    },

    trompetteVoices () {
        return  this.multiStrings ? this.preset.voices.trompette : [this.preset.voices.trompette[0]]
    },
}

const methods = {
    hasSound (voice) {
        return voice.soundfont && voice.note >= 0
    },

    stateChanged () {
        this.$emit('update:state', this.preset)
    },

    soundfontChanged (val, voice) {
        if (!val && voice.soundfont) {
            voice.muted = true
        } else if (val && !voice.soundfont) {
            voice.muted = false
        }
        voice.soundfont = val
        this.$emit('update:state', this.preset)
    }
}

export default {
    name: 'state-edit',
    props: ['state', 'showName'],
    data,
    watch,
    methods,
    computed,
    components: {
        VoiceEdit,
        VoiceMixer,
        TuningConfig,
        EffectConfig,
        ChienConfig
    }
}
</script>
