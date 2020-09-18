<template>
<div
    class="input-group input-group--text-field primary--text"
    :class="[{'input-group--focused': hasFocus, 'input-group--dirty': value !== undefined, 'no-caret': noCaret}, inputClass]">
        <label v-if="label">{{ label }}</label>
        <div class="input-group__input">
            <select
                v-on:focus="hasFocus = true"
                v-on:blur="hasFocus = false"
                :disabled="disabled"
                :value="value"
                @input="$emit('update:value', convert($event.target.value))"
                >
                <option v-for="choice in choices" :value="choice.value" :key="choice.value">
                    {{ choice.text }}
                </option>
            </select>
        </div>
        <div class="input-group__details"></div>
    </div>
</template>

<style scoped>
select {
    -moz-appearance: menulist;
    -webkit-appearance: menulist;
    font-size: 16px;
    width: 100%;
    color: #000;
}

.theme--dark select {
    color: #fff;
    background: #424242;
}

.no-caret select {
    -moz-appearance: listbox;
    -webkit-appearance: listbox;
}

select:disabled {
    opacity: 0.4;
}

select:focus {
    outline: none;
}

</style>

<script>
function data () {
    return {
        hasFocus: false
    }
}

const methods = {
    convert (val) {
        if (this.numericValue === false) {
            return val
        } else {
            return parseInt(val, 10)
        }
    }
}

export default {
    name: 'single-select',
    props: [
        'label',
        'value',
        'choices',
        'inputClass',
        'disabled',
        'noCaret',
        'numericValue'
    ],
    data,
    methods
}
</script>
