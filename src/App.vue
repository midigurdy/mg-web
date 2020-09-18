<template>

<v-app :dark="darkTheme">
    <mg-navbar/>
    <v-content>
        <v-container fluid>
            <router-view></router-view>
        </v-container>
    </v-content>
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
    }
}
</script>

<style>
#toast-container {
    margin-top: 55px;
}

.vis-body #app {
    background-color: #000 !important;
}

.slider__thumb {
  width: 24px;
  height: 24px;
  left: -12px;
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

.btn .icon--left {
    margin-right: 8px;
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
