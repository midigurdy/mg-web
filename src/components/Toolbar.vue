<template>

<v-toolbar :color="bgColor" dark flat fixed app :tabs="tabs">
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
    },

    bgColor () {
        return (this.$store.state.ui.darkTheme) ? '' : 'indigo'
    }
}

export default {
    name: 'mg-toolbar',
    computed,
    props: ['title', 'tabs']
}
</script>
