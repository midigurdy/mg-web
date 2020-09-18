<template>
    <v-container>
        <mg-toolbar title="Import / Export"></mg-toolbar>

        <v-card>
            <v-card-text>
            <p>Please choose which parts of the configuration to import / export:</p>
                <v-switch label="Presets" v-model="presets"/>
                <v-switch label="Advanced / Sensor Mappings" v-model="mappings"/>
                <v-switch label="Advanced / Keyboard Calibration" v-model="calibration"/>
                <v-switch label="Advanced / Settings" v-model="settings"/>
            </v-card-text>
        </v-card>

        <v-card class="mt-5">
            <v-card-title class="headline">Export</v-card-title>
            <v-card-text>
                <p>Press the button below to export the selected configuration
                and store it on your computer.</p>

                <v-btn color="primary" :disabled="!(presets || mappings || calibration || settings)"
                    :href="'/api/config?presets='+presets+'&mappings='+mappings+'&calibration='+calibration+'&settings='+settings"
                >
                <v-icon left>cloud_download</v-icon> Export Configuration
                </v-btn>
            </v-card-text>
        </v-card>

        <v-card class="mt-5">
            <v-card-title class="headline">Import</v-card-title>
            <v-card-text>
                <p>Select the file from your computer to replace the selected configuration.</p>

                <v-file-input show-size outlined label="Configuration File" v-model="filename"></v-file-input>

                <v-btn class="primary" disabled v-if="busy">
                    <v-icon left>cloud_upload</v-icon>
                    Importing, please wait...
                </v-btn>
                <v-btn v-else class="primary" @click="doImport"
                    :disabled="!(presets || mappings || calibration || settings) || !filename"
                    >
                    <v-icon left>cloud_upload</v-icon>
                    Import Configuration
                </v-btn>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import API from '@/api'

function data () {
    return {
        filename: null,
        presets: false,
        mappings: false,
        calibration: false,
        settings: false,
        busy: false,
    }
}

const methods = {
    reset () {
        this.$refs.fileupload.value = ''
        this.filename = null
        this.presets = false
        this.mappings = false
        this.calibration = false
        this.settings = false
        this.busy = false
    },

    doImport () {
        this.busy = true
        var reader = new FileReader()
        reader.readAsText(this.filename)
        reader.onload = () => {
            API.importConfig(
                reader.result,
                this.presets,
                this.mappings,
                this.calibration,
                this.settings
            )
            .then(() => {
                this.$store.dispatch('fetchSoundFonts')
                this.$store.dispatch('fetchPresets')
                this.$store.dispatch('fetchInstrumentState')
                this.$store.dispatch('snacks/add', {
                    message: 'The configuration has been restored',
                    timeout: 2000
                })
                this.reset()
            })
            this.busy = false
        }
    },
}

const watch = {
}

export default {
    name: 'import-export',
    data,
    methods,
    watch,

    mounted () {
        this.reset()
    }
}
</script>
