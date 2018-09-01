<template>
    <v-card>
        <v-card-title>
            <h2><v-icon>pets</v-icon> Chien Setup</h2>
        </v-card-title>
        <v-card-text>
            <v-layout row>
                <v-flex xs10>
                    <v-slider
                        label="Sensitivity (%)"
                        :value="sensitivity"
                        @input="setSensitivity($event)"
                        tabindex="-1"
                        />
                </v-flex>
                <v-flex xs2>
                    <v-text-field
                        :value="sensitivity"
                        @change="setSensitivity($event)"
                        type="number"/>
                        </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
const methods = {
    setSensitivity (percent) {
        percent = Math.min(100, Math.max(0, percent))
        this.$emit('update:sensitivity', percent)
    }
}

export default {
    name: 'chien-config',
    props: ['sensitivity'],
    methods
}
</script>
