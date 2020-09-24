<template>
    <v-card>
        <v-card-title class="font-weight-bold">
            <v-icon left>audiotrack</v-icon> Tuning &amp; Pitch Bend
        </v-card-title>
        <v-card-text>
            <v-row style="flex-wrap: nowrap">
                <v-col cols="6">
                    <v-select
                        label="Coarse Tune"
                        :items="coarseTuningChoices"
                        :value="coarse"
                        :menu-props="{auto: true, transition: null}"
                        @change="$emit('update:coarse', $event)"
                        />
                </v-col>
                <v-col cols="6">
                    <v-select
                        label="Fine Tune"
                        :items="fineTuningChoices"
                        :value="fine"
                        :menu-props="{auto: true, transition: null}"
                        @change="$emit('update:fine', $event)"
                        />
                </v-col>
            </v-row>
            <v-row style="flex-wrap: nowrap">
                <v-col :cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 50px; max-width: 100%">
                    <v-slider
                        label="Pitch Bend (Cent)"
                        :value="pitchbend_range"
                        max="200"
                        @input="setPitchbendRange($event)"
                        tabindex="-1"
                        />
                </v-col>
                <v-col cols="2" class="flex-grow-0 flex-shrink-1" style="min-width: 3em">
                    <v-text-field
                        :value="pitchbend_range"
                        @change="setPitchbendRange($event)"
                        dense
                        type="number"/>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<style>
</style>

<script>
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
    }
}
</script>
