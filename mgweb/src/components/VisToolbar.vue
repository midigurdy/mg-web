<template>

<v-toolbar color="indigo" dark fixed app>
    <v-toolbar-side-icon @click.stop="toggleNavbar"></v-toolbar-side-icon>
    <v-toolbar-title>Wheel Visualisation</v-toolbar-title>
    <v-spacer/>
    <v-toolbar-items>
        <v-btn @click.stop="toggleControls" flat><v-icon>settings</v-icon> Settings</v-btn>
    </v-toolbar-items>
</v-toolbar>

</template>

<script>

const methods = {
    toggleNavbar () {
        this.$store.commit('uiUpdateNavbar', !this.$store.state.ui.navbar)
    },

    toggleControls () {
        this.$store.commit('uiUpdateVisControls', !this.$store.state.ui.visControls)
    }
}

export default {
    name: 'vis-toolbar',
    methods
}
</script>
