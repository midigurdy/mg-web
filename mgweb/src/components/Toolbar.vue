<template>

<v-toolbar color="indigo" flat dark fixed app :tabs="tabs">
    <slot name="icon">
        <v-toolbar-side-icon @click.stop="navbar = !navbar"></v-toolbar-side-icon>
    </slot>
    <v-toolbar-title>{{ title }}</v-toolbar-title>
    <slot name="tabs" slot="extension"></slot>
    <slot></slot>
</v-toolbar>

</template>

<script>

const computed = {
    navbar: {
        get () {
            return this.$store.state.ui.navbar
        },
        set (value) {
            this.$store.commit('uiUpdateNavbar', value)
        }
    }
}

export default {
    name: 'mg-toolbar',
    computed,
    props: ['title', 'tabs']
}
</script>
