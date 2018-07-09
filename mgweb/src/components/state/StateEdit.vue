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
                <v-card-title>
                    <h2><v-icon>tune</v-icon> Mixer</h2>
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
                        v-for="(voice, index) in preset.voices.melody"
                        :key="'m' + index"
                        :title="'Melody ' + (index + 1)"
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
                        v-for="(voice, index) in preset.voices.drone"
                        :key="'d' + index"
                        :title="'Drone ' + (index + 1)"
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
                        v-for="(voice, index) in preset.voices.trompette"
                        :key="'t' + index"
                        :title="'Tromp. ' + (index + 1)"
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
                <v-card-title>
                    <h2><v-icon>queue_music</v-icon> String Setup</h2>
                </v-card-title>
                <v-container fluid>
                    <voice-edit
                        v-for="(voice, index) in preset.voices.melody"
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
                        :number="index + 1"/>
                
                    <voice-edit
                        v-for="(voice, index) in preset.voices.drone"
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
                        :number="index + 1"/>

                    <voice-edit
                        v-for="(voice, index) in preset.voices.trompette"
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
                        :number="index + 1"/>
                </v-container>
            </v-card>
        </v-flex>
        <v-flex xs12>
            <chien-config
                :sensitivity="preset.chien.threshold"
                @update:sensitivity="preset.chien.threshold = $event; stateChanged()"
                />
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
    components: {
        VoiceEdit,
        VoiceMixer,
        TuningConfig,
        EffectConfig,
        ChienConfig
    }
}
</script>
