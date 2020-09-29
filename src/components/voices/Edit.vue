<template>
    <div>
        <v-row align="center">
            <v-col cols="2">
                <div @click="toggleDetails" class="noselect" style="cursor: pointer; margin-left: -1em">
                    <v-icon v-if="showDetails">expand_less</v-icon>
                    <v-icon v-else>expand_more</v-icon>
                    {{ label }} {{ number }}
                </div>
            </v-col>
            <v-col cols="6">
                <sound-select
                    :sound_id="soundId" v-on:input="setSound($event)"
                    :options="soundfontTree"/>
            </v-col>
            <v-col cols="2">
                    <v-select
                        inputClass="flex xs6"
                        :items="noteChoices"
                        :value="localNote"
                        @change="noteChanged($event)"
                        :menu-props="{auto: true, transition: null}"
                        :disabled="!soundId"
                        noCaret="true"
                        dense
                        />
            </v-col>
            <v-col cols="2">
                    <v-select
                        inputClass="flex xs6"
                        :items="octaveChoices"
                        :value="octave"
                        @change="octaveChanged($event)"
                        :menu-props="{auto: true, transition: null}"
                        :disabled="!soundId"
                        noCaret="true"
                        dense
                        />
            </v-col>
        </v-row>
        <v-row class="string-details" v-if="showDetails" align="center">
                <v-col cols="3">
                    <v-select
                        label="Fine Tune"
                        :items="fineTuningChoices"
                        :value="finetune"
                        :menu-props="{auto: true, transition: null}"
                        @change="$emit('update:finetune', $event)"
                        dense
                        hide-details
                        />
                </v-col>
                <template v-if="type == 'melody'">
                    <v-col cols="3">
                        <v-select
                            label="Capo Key"
                            :items="capoChoices"
                            :value="capo"
                            @change="$emit('update:capo', $event)"
                            :menu-props="{auto: true, transition: null}"
                            dense
                            hide-details
                            />
                    </v-col>
                    <v-col cols="3">
                        <v-checkbox
                            label="Polyphonic"
                            :input-value="polyphonic"
                            @change="$emit('update:polyphonic', $event)"
                            dense
                            hide-details
                            />
                        <v-checkbox
                            v-if="soundfontMode === 'generic'"
                            label="Keyboard Mode"
                            :input-value="mode === 'keyboard'"
                            @change="$emit('update:mode', $event ? 'keyboard' : 'midigurdy')"
                            dense
                            hide-details
                            />
                    </v-col>
                </template>
        </v-row>
    </div>
</template>

<script>
import MidiFilters from '@/mixins/midifilters'
import SoundSelect from '@/components/sounds/SoundSelect'

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

    soundfontMode () {
        if (this.soundfont) {
            var font = this.$store.getters.getSoundfont(this.soundfont)
            if (font) {
                return font.mode
            }
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
        var baseNote = null
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
                if (result.sound.note !== -1) {
                    baseNote = result.sound.note
                }
            } else {
                this.$emit('update:soundfont', null)
                this.$emit('update:bank', 0)
                this.$emit('update:program', 0)
                this.$emit('update:mode', 'midigurdy')
                baseNote = -1
                this.showDetails = false
            }
        } else {
            this.$emit('update:soundfont', null)
            this.$emit('update:bank', 0)
            this.$emit('update:program', 0)
            this.$emit('update:mode', 'midigurdy')
            baseNote = -1
            this.showDetails = false
        }
        if (baseNote !== null) {
            this.$emit('update:note', baseNote)
        }
    },

    updateBaseNote () {
        var baseNote = Math.min(127, this.localNote + ((this.octave === null ? 5 : this.octave) * 12))
        this.$emit('update:note', baseNote)
    }
}

export default {
    components: { SoundSelect },
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
    margin-bottom: 0.5em;
}
</style>
