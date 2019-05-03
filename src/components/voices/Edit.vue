<template>
    <div class="container grid-list-sm">
        <div class="layout row wrap">
            <div class="flex xs3" style="padding-top: 0.5em; text-align: left">
                <div @click="toggleDetails" class="noselect" style="cursor: pointer; margin-left: -1em">
                    <v-icon v-if="showDetails">expand_less</v-icon>
                    <v-icon v-else>expand_more</v-icon>
                    {{ label }} {{ number }}
                </div>
            </div>
            <div class="flex xs6">
                <sound-select
                    :sound_id="soundId" v-on:input="setSound($event)"
                    :options="soundfontTree"/>
            </div>
            <div class="flex xs3">
                <div class="layout">
                    <single-select
                        inputClass="flex xs6"
                        :choices="noteChoices"
                        :value="localNote"
                        @update:value="noteChanged($event)"
                        :disabled="!soundId"
                        noCaret="true"
                        />
                    <single-select
                        inputClass="flex xs6"
                        :choices="octaveChoices"
                        :value="octave"
                        @update:value="octaveChanged($event)"
                        :disabled="!soundId"
                        noCaret="true"
                        />
                </div>
            </div>
        </div>
        <v-card flat class="string-details" v-if="showDetails">
            <div class="layout">
                <div class="flex xs3">
                    <single-select
                        label="Fine Tune"
                        :choices="fineTuningChoices"
                        :value="finetune"
                        @update:value="$emit('update:finetune', $event)"
                        />
                </div>
                <template v-if="type == 'melody'">
                    <div class="flex xs3" style="padding-left: 3em">
                        <label style="color: grey; font-size: 13px">Polyphonic</label>
                        <v-switch
                        :input-value="polyphonic"
                        @change="$emit('update:polyphonic', $event)"
                        />
                    </div>
                    <div class="flex xs3">
                        <single-select
                            label="Capo Key"
                            :choices="capoChoices"
                            :value="capo"
                            @update:value="$emit('update:capo', $event)"
                            />
                    </div>
                    <div class="flex xs3">
                        <single-select
                            label="Mode"
                            :choices="melodyModeChoices"
                            :value="mode"
                            @update:value="$emit('update:mode', $event)"
                            :numericValue="false"
                            />
                    </div>
                </template>
                <template v-if="type == 'trompette'">
                    <div class="flex xs3">
                        <single-select
                            label="Mode"
                            :choices="chienModeChoices"
                            :value="mode"
                            @update:value="$emit('update:mode', $event)"
                            :numericValue="false"
                            />
                    </div>
                </template>
            </div>
        </v-card>
</div>
</template>

<script>
import MidiFilters from '@/mixins/midifilters'
import SoundSelect from '@/components/sounds/SoundSelect'
import SingleSelect from '@/components/forms/SingleSelect'

function data () {
    return {
        showDetails: false,
        localNote: null,
        octave: null
    }
}

const watch = {
    note () {
        if (this.note === -1) {
            this.localNote = null
            this.octave = null
        } else {
            this.localNote = this.note % 12
            this.octave = parseInt(this.note / 12, 10)
        }
    }
}

const computed = {

    soundId () {
        if (this.soundfont) {
            return [this.soundfont, this.bank, this.program].join(':')
        } else {
            return null
        }
    },

    fineTuningChoices () {
        var choices = []
        for (var i = 100; i >= -100; i--) {
            var num = i > 0 ? '+' + i : i
            var label = ' cent' + (Math.abs(i) === 1 ? '' : 's')
            choices.push({
                text: i === 0 ? 'standard' : num + label,
                value: i
            })
        }
        return choices
    },

    capoChoices () {
        var choices = [{
            text: 'No capo',
            value: 0
        }]
        for (var capo = 1; capo < 25; capo++) {
            choices.push({
                text: 'Key ' + (capo),
                value: capo
            })
        }
        return choices
    },

    noteChoices () {
        var choices = []
        for (var note = 11; note >= 0; note--) {
            choices.push({
                text: MidiFilters.filters.midiBaseNote(note),
                value: note
            })
        }
        return choices
    },

    melodyModeChoices () {
        return [
            {text: 'MidiGurdy', value: 'midigurdy'},
            {text: 'Hurdy-Gurdy', value: 'generic'},
            {text: 'Keyboard', value: 'keyboard'}
        ]
    },

    chienModeChoices () {
        return [
            {text: 'MidiGurdy', value: 'midigurdy'},
            {text: 'Percussion', value: 'generic'}
        ]
    },

    octaveChoices () {
        var choices = []
        for (var octave = 10; octave >= 0; octave--) {
            choices.push({
                text: MidiFilters.filters.midiOctave(octave * 12),
                value: octave
            })
        }
        return choices
    },

    soundfontTree () {
        return this.$store.getters.soundFontTree
    }
}

const methods = {
    noteChanged (val) {
        this.localNote = val
        this.updateBaseNote()
    },

    octaveChanged (val) {
        this.octave = val
        this.updateBaseNote()
    },

    toggleDetails () {
        this.showDetails = !this.showDetails
    },

    setSound (soundId) {
        var baseNote = -1
        if (soundId) {
            var result = this.$store.getters.getSoundAndFont(soundId)
            if (result) {
                this.$emit('update:soundfont', result.soundfont.id)
                this.$emit('update:bank', result.sound.bank)
                this.$emit('update:program', result.sound.program)
                if (this.mode !== 'keyboard' || result.soundfont.mode === 'midigurdy') {
                    /* If a trompette string is set to a sound that is not of type trompette,
                       set the mode to generic automatically */
                    if (this.type === 'trompette') {
                        this.$emit('update:mode', (result.sound.type === 'trompette') ? 'midigurdy' : 'generic')
                    } else {
                        this.$emit('update:mode', result.soundfont.mode)
                    }
                }
                baseNote = result.sound.note
            } else {
                this.$emit('update:soundfont', null)
                this.$emit('update:bank', 0)
                this.$emit('update:program', 0)
                this.$emit('update:mode', 'midigurdy')

                if (this.octave === null || this.localNote === null) {
                    baseNote = 60
                }
            }
        } else {
            this.$emit('update:soundfont', null)
            this.$emit('update:bank', 0)
            this.$emit('update:program', 0)
            this.$emit('update:mode', 'midigurdy')
            baseNote = -1
            this.showDetails = false
        }
        this.$emit('update:note', baseNote)
    },

    updateBaseNote () {
        var baseNote = Math.min(127, this.localNote + ((this.octave === null ? 5 : this.octave) * 12))
        this.$emit('update:note', baseNote)
    }
}

export default {
    components: { SoundSelect, SingleSelect },
    mixins: [MidiFilters],
    props: [
        'type', 'number', 'label',
        'soundfont',
        'bank',
        'program',
        'note',
        'mode',
        'capo',
        'polyphonic',
        'finetune'
    ],
    data,
    computed,
    methods,
    watch
}
</script>

<style scoped>
.vue-treeselect label {
    text-align: left;
}

.string-details {
    border-bottom: 1px solid #ddd;
    margin-bottom: 0.5em;
}
</style>
