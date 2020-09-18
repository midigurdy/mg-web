<template>

<v-app-bar :color="bgColor" dark flat fixed app>
    <slot name="icon">
        <v-app-bar-nav-icon @click.stop="navbar = !navbar"></v-app-bar-nav-icon>
    </slot>
    <v-toolbar-title>{{ title }}</v-toolbar-title>
    <slot></slot>
</v-app-bar>

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
    props: ['title']
}
</script>
