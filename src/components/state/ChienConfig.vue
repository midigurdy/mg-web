<template>
    <v-layout row>
        <v-flex xs10>
            <v-slider
                :label="title"
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
    props: ['sensitivity', 'title'],
    methods
}
</script>

<style scoped>
.layout .flex {
    padding: 0 !important;
}

.flex .input-group {
    padding: 0
}
.flex .input-group--slider {
    padding-left: 10px;
    padding-right: 20px;
}
</style>
