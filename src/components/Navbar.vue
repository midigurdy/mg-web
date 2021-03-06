<template>

<v-navigation-drawer v-model="navbar" fixed app stateless :mini-variant="mini" width="300">

    <div>
        <v-card-title
            class="mg-header"
            :class="{'not-connected': !connected}"
            :title="connected ? 'Connected to ' + info.name : 'You are not connected!'"
            >
            <div v-if="mini">
                <v-icon v-if="connected" color="success">check_circle</v-icon>
                <v-icon v-else color="error">warning</v-icon>
            </div>
            <div v-else>
                <v-icon v-if="!connected" color="white" left dense>warning</v-icon>
                <span class="font-weight-bold">MidiGurdy</span>
                <span class="caption" id="version-string">{{ info.version }}</span>
            </div>
        </v-card-title>
    </div>

    <v-divider></v-divider>

    <v-list>
        <template v-for="link in links">
            <v-divider v-if="link.class" :key="link.label"/>
            <v-list-item :to="link.to" :key="link.to">
                <v-list-item-action>
                    <v-icon>{{ link.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>{{ link.label }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>
            <v-list-item @click="mini = !mini" class="mt-4">
                <v-list-item-action>
                    <v-icon v-if="mini">chevron_right</v-icon>
                    <v-icon v-else>chevron_left</v-icon>
                </v-list-item-action>
                <v-list-item-content></v-list-item-content>
            </v-list-item>
    </v-list>
</v-navigation-drawer>

</template>

<script>

const links = [
    {to: '/instrument', label: 'Instrument Setup', icon: 'play_circle_filled'},
    {to: '/presets', label: 'Presets', icon: 'description'},
    {to: '/sounds', label: 'Sounds', icon: 'headset'},
    {to: '/visualization', label: 'Wheel Visualisation', icon: 'donut_large', class: 'mt-3'},
    {to: '/misc', label: 'Settings', icon: 'settings', class: 'mt-3'},
    {to: '/mapping/speed_to_melody_volume', label: 'Sensor Mappings', icon: 'timeline'},
    {to: '/key-calibration', label: 'Keyboard Calibration', icon: 'keyboard'},
    {to: '/export', label: 'Import / Export', icon: 'import_export'},
    {to: '/help', label: 'Help', icon: 'help', class: 'mt-3'},

]

function data () {
    return {
        links,
        mini: false
    }
}

const computed = {
    info () {
        return this.$store.state.systemInformation
    },

    connected () {
        return this.$store.state.connected
    },

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
    name: 'mg-navbar',
    data,
    computed
}

</script>

<style scoped>
    #version-string {
        margin-left: 1em;
    }

    .footer {
        background: transparent;
    }

    .mg-header.not-connected {
        background: darkred;
        color: white;
    }
</style>
