<template>
    <div>
        <treeselect :value="sound_id"
        @select="$emit('input', $event.id)"
        @delselect="$emit('input', undefined)"
        :clearable="true" :multiple="false" :options="options"
        :beforeClearAll="beforeClear"
        :disable-branch-nodes="true"
        :show-count="true"
        :flat="true"
        placeholder="Select a sound...">
            <label slot="option-label" slot-scope="{ node, shouldShowCount, count, labelClassName, countClassName }" :class="labelClassName">
                {{ node.isBranch ? node.label : node.raw.list_label }}
                <span v-if="shouldShowCount" :class="countClassName">({{ count }})</span>
            </label>
        </treeselect>
    </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'

export default {
    name: 'sound-select',
    components: { Treeselect },
    props: ['sound_id', 'options'],
    methods: {
        beforeClear () {
            /* Used to react to pressing the "clear" button
             * on treeselect, as it doesn't provide an event for this */
            return new Promise((resolve, reject) => {
                resolve(true)
            }).finally(() => {
                this.$emit('input', undefined)
            })
        }
    }
}
</script>

<style src="@riophae/vue-treeselect/dist/vue-treeselect.min.css"></style>
