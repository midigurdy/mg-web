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

<style>
.theme--dark .vue-treeselect__control {
    background: #626262;
    border-color: #303030;
}

.theme--dark .vue-treeselect:not(.vue-treeselect--disabled):not(.vue-treeselect--focused) .vue-treeselect__control:hover {
  border-color: #727272;
}

.theme--dark .vue-treeselect--open .vue-treeselect__control,
.theme--dark .vue-treeselect__control:hover {
  border-color: #727272;
}

.theme--dark .vue-treeselect__menu {
    background: #626262;
    border-color: #727272;
}

.theme--dark .vue-treeselect--open-below .vue-treeselect__menu,
.theme--dark .vue-treeselect--open-above .vue-treeselect__menu {
    border-color: #727272;
}

.theme--dark .vue-treeselect__placeholder,
.theme--dark .vue-treeselect--focused.vue-treeselect--searchable .vue-treeselect__single-value {
  color: #aaa;
}
.theme--dark .vue-treeselect__single-value {
  color: #fafafa;
}
.theme-dark .vue-treeselect__multi-value-item {
    color: #fafafa;
}
.theme--dark .vue-treeselect:not(.vue-treeselect--disabled) .vue-treeselect__multi-value-item:not(.vue-treeselect__multi-value-item-disabled):hover {
    color: #fafafa;
}
.theme--dark .vue-treeselect__multi-value-item.vue-treeselect__multi-value-item-disabled {
    color: #fafafa;
}
.theme--dark .vue-treeselect__option--highlight {
  background: #727272;
}
.theme--dark .vue-treeselect--single .vue-treeselect__option--selected {
  background: #727272;
  font-weight: 600;
}
.theme--dark .vue-treeselect--single .vue-treeselect__option--selected:hover {
  background: #727272;
}
</style>

<style src="@riophae/vue-treeselect/dist/vue-treeselect.min.css"></style>

