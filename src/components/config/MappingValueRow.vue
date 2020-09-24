<template>
    <v-row>
        <v-flex xs4 class="text-center">
            <v-btn text icon small @click="$emit('addRange', index)" :tabindex="-1"
                title="Add control point below"
                ><v-icon>add</v-icon></v-btn>
            <v-btn text icon small @click="$emit('removeRange', index)" :tabindex="-1"
                title="Remove this control point"
                ><v-icon>remove</v-icon></v-btn>
        </v-flex>
        <v-flex xs4>
            <v-text-field dense class="number-field" hide-details type="number" :value="range.src" @change="onValueChange($event, index, 'src')"/>
        </v-flex>
        <v-flex xs4>
            <v-text-field dense class="number-field" hide-details type="number" :value="range.dst" @change="onValueChange($event, index, 'dst')"/>
        </v-flex>
    </v-row>
</template>

<script>

export default {
    name: 'mapping-value-row',
    props: ['range', 'index'],
}
</script>
