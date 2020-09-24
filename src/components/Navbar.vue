<template>

<v-navigation-drawer v-model="navbar" fixed app stateless :mini-variant="mini" width="300">

    <div>
        <v-card-title>
            <div v-if="mini" :class="{'red--text': !connected }">
                <v-icon v-if="connected" color="success">check_circle</v-icon>
                <v-icon v-else color="error">warning</v-icon>
            </div>
            <div v-else>
                <span class="font-weight-bold">MidiGurdy</span>
                <span class="caption" id="version-string">{{ info.version }}</span>
            </div>
        </v-card-title>
        <v-card-text v-if="!mini">
            <v-alert type="error" :value="!connected" outlined>
                You are not connected!
            </v-alert>
            <v-alert type="success" :value="connected" outlined>
                Connected to {{ info.name }}
            </v-alert>
        </v-card-text>
    </div>

    <v-divider></v-divider>

    <v-list>
        <template v-for="link in links">
            <v-list-group v-if="link.children" :prepend-icon="link.icon" :key="link.to">
                <template v-slot:activator>
                    <v-list-item-title v-text="link.label"></v-list-item-title>
                </template>
                <v-list-item v-for="child in link.children" :to="child.to" :key="child.to">
                    <v-list-item-action>
                        <v-icon>{{ child.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>{{ child.label }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list-group>
            <v-list-item v-else :to="link.to" :key="link.to">
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
    {to: '/visualization', label: 'Wheel Visualisation', icon: 'donut_large'},
    {to: '/presets', label: 'Presets', icon: 'description'},
    {to: '/sounds', label: 'Sounds', icon: 'headset'},
    {
        label: 'Advanced',
        icon: 'settings',
        children: [
            {to: '/mapping/speed_to_melody_volume', label: 'Sensor Mappings', icon: 'timeline'},
            {to: '/key-calibration', label: 'Keyboard Calibration', icon: 'keyboard'},
            {to: '/misc', label: 'Settings', icon: 'stars'}
        ]
    },
    {to: '/export', label: 'Import / Export', icon: 'import_export'},
    {to: '/help', label: 'Help', icon: 'help'}
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

</style>
