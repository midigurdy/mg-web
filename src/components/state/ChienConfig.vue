<template>
    <v-row style="flex-wrap: nowrap">
        <v-col :cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 50px; max-width: 100%">
            <v-slider
                :label="title"
                :value="sensitivity"
                @input="setSensitivity($event)"
                tabindex="-1"
                />
        </v-col>
        <v-col cols="2" class="flex-grow-0 flex-shrink-1" style="min-width: 3em">
            <v-text-field
                :value="sensitivity"
                @change="setSensitivity($event)"
                type="number"
                suffix="%"
                dense
                />
        </v-col>
    </v-row>
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
