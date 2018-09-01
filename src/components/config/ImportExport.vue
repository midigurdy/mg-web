<template>
    <v-container flex>
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

        <v-card>
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

        <v-card>
            <v-card-title class="headline">Import</v-card-title>
            <v-card-text>
                <p>Select the file from your computer and replace the selected
                configuration.</p>

                <form enctype="multipart/form-data" novalidate>
                <p><input id="fileupload" ref="fileupload" type="file"
                    name="sound"
                    @change.stop="filesChange($event.target.files); fileCount = $event.target.files.length">
                </p>
                </form>

                <v-btn class="primary" @click="doImport"
                    :disabled="!(presets || mappings || calibration || settings) || !fileData"
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
        fileData: null,
        presets: false,
        mappings: false,
        calibration: false,
        settings: false
    }
}

const methods = {
    reset () {
        this.$refs.fileupload.value = ''
        this.fileData = null
        this.presets = false
        this.mappings = false
        this.calibration = false
        this.settings = false
    },

    doImport () {
        API.importConfig(this.fileData, this.presets, this.mappings, this.calibration, this.settings)
            .then((result) => {
                this.$store.dispatch('fetchSoundFonts')
                this.$store.dispatch('fetchPresets')
                this.$store.dispatch('fetchInstrumentState')
                this.$store.dispatch('snacks/add', {
                    message: 'The configuration has been restored',
                    timeout: 2000
                })
                this.reset()
            })
    },

    filesChange (files) {
        if (files) {
            this.fileData = files[0]
        } else {
            this.fileData = null
        }
    }
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

<style scoped>
.card {
    margin-bottom: 1em;
}
</style>
