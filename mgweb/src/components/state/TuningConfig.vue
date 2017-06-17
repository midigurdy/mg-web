<template>
    <v-card>
        <v-card-title>
            <h2><v-icon>audiotrack</v-icon> Tuning &amp; Pitch Bend</h2>
        </v-card-title>
        <v-card-text>
            <v-layout row wrap>
                <v-flex xs6>
                    <single-select
                        label="Coarse Tune"
                        :choices="coarseTuningChoices"
                        :value="coarse"
                        @update:value="$emit('update:coarse', $event)"
                        />
                </v-flex>
                <v-flex xs6>
                    <single-select
                        label="Fine Tune"
                        :choices="fineTuningChoices"
                        :value="fine"
                        @update:value="$emit('update:fine', $event)"
                        />
                </v-flex>
                <v-flex xs10>
                    <v-slider
                        label="Pitch Bend (Cent)"
                        :value="pitchbend_range"
                        max="200"
                        @input="setPitchbendRange($event)"
                        tabindex="-1"
                        />
                </v-flex>
                <v-flex xs2>
                    <v-text-field
                        :value="pitchbend_range"
                        @change="setPitchbendRange($event)"
                        type="number"/>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<style>
</style>

<script>
import SingleSelect from '@/components/forms/SingleSelect'

const computed = {
    coarseTuningChoices () {
        var choices = []
        for (var i = 64; i > -64; i--) {
            var num = i > 0 ? '+' + i : i
            var label = ' semitone' + (Math.abs(i) === 1 ? '' : 's')
            choices.push({
                text: i === 0 ? 'standard' : num + label,
                value: i
            })
        }
        return choices
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
    }
}

const methods = {
    setPitchbendRange (val) {
        val = Math.min(200, Math.max(0, val))
        this.$emit('update:pitchbend_range', val)
    }
}

export default {
    name: 'tuning-config',
    props: ['coarse', 'fine', 'pitchbend_range'],
    computed,
    methods,
    components: {
        SingleSelect
    }
}
</script>
