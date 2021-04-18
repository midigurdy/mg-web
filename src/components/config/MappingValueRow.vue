<template>
    <v-row>
        <v-flex xs4 class="text-right">
            <v-btn
                text icon small
                :tabindex="-1"
                v-if="range.src < mapping.src.max"
                @click="$emit('addRange')"
                title="Add control point below"
                ><v-icon>add</v-icon></v-btn>
            <v-btn
                text icon small
                :tabindex="-1"
                @click="$emit('removeRange')"
                title="Remove this control point"
                ><v-icon>remove</v-icon></v-btn>
        </v-flex>
        <v-flex xs4>
            <v-text-field
                dense
                hide-details
                type="number"
                class="number-field"
                :value="range.src"
                @change="$emit('srcValueChange', $event)"
                />
        </v-flex>
        <v-flex xs4>
            <v-text-field
                dense
                hide-details
                type="number"
                class="number-field"
                :value="range.dst"
                @change="$emit('dstValueChange', $event)"
                />
        </v-flex>
    </v-row>
</template>

<script>
export default {
    name: 'mapping-value-row',
    props: ['range', 'mapping'],
}
</script>
