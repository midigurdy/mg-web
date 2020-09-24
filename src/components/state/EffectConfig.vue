<template>
    <v-card>
        <v-card-title class="font-weight-bold">
            <v-icon left>settings</v-icon> Effects Setup
        </v-card-title>
        <v-card-text>
            <label>Keynoise Sound</label>
            <sound-select
                :sound_id="keynoiseSoundfont"
                v-on:input="setSound($event)"
                :options="soundfontTree"/>
        </v-card-text>
    </v-card>
</template>

<style scoped>
label {
    font-size: 16px;
    color: grey;
}

</style>

<script>
import SoundSelect from '@/components/sounds/SoundSelect'

const computed = {
    soundfontTree () {
        return this.$store.getters.typedSoundFontTree('keynoise')
    }
}

const methods = {
    setSound (val) {
        if (val) {
            var result = this.$store.getters.getSoundAndFont(val)
            if (result) {
                this.$emit('update:keynoiseSoundfont', result.soundfont.id)
                this.$emit('update:keynoiseBank', result.sound.bank)
                this.$emit('update:keynoiseProgram', result.sound.program)
                return
            }
        }
        this.$emit('update:keynoiseSoundfont', null)
        this.$emit('update:keynoiseBank', 0)
        this.$emit('update:keynoiseProgram', 0)
    }
}

export default {
    name: 'effect-config',
    props: [
        'keynoiseSoundfont',
        'keynoiseBank',
        'keynoiseProgram'
    ],
    computed,
    methods,
    components: {
        SoundSelect
    }
}
</script>
