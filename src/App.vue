<template>

<v-app>
    <mg-navbar/>
    <v-main>
        <v-container fluid>
        <keep-alive include="instrument-state">
                <router-view></router-view>
        </keep-alive>
        </v-container>
    </v-main>
    <notifications/>
</v-app>

</template>

<script>

import Navbar from '@/components/Navbar'
import Notifications from '@/components/Notifications'

export default {
    name: 'app',
    components: {
        'mg-navbar': Navbar,
        Notifications
    },
    computed: {
        darkTheme () {
            return this.$store.state.ui.darkTheme
        }
    },
    watch: {
        darkTheme (dark) {
            this.$vuetify.theme.dark = dark
        },
    },
    mounted () {
        this.$vuetify.theme.dark = this.darkTheme
    },
}
</script>

<style>
#toast-container {
    margin-top: 55px;
}

.vis-body #app {
    background-color: #000 !important;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}

input[type='number'] {
    -moz-appearance:textfield;
    margin: 0;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.mixer-panel .flex .input-group .input-group__details:before {
    background-color: #fff !important;
}

.mixer-panel .input-group__details {
    /* for less spacing in mixer:  display: none; */
}

.number-field input[type="number"] {
    text-align: right;
}
</style>
