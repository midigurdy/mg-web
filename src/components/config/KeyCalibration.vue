<template>
    <div>
        <mg-toolbar title="Keyboard Calibration">
            <v-spacer/>
            <v-toolbar-items>
                <v-btn text :icon="$vuetify.breakpoint.xs" @click="resetKeyCalibration">
                    <v-icon left>settings</v-icon> <span class="hidden-xs-only">Reset to Defaults</span>
                </v-btn>
                <v-btn text :icon="$vuetify.breakpoint.xs" @click="saveKeyData()">
                    <v-icon left>done</v-icon> <span class="hidden-xs-only">Save Calibration</span>
                </v-btn>
            </v-toolbar-items>
        </mg-toolbar>

        <v-card class="mb-4">
            <v-card-text>
                <p>Here you can calibrate the <strong>maximum pressure</strong> and adjust the <strong>velocity response</strong>
                    of the keyboard sensors.</p>
                <p>
                    The <b>Velocity</b> fields can be used to adjust the velocity
                    response of each key.  The range is -100 to 100, with negative
                    values meaning "less sensitive", positive meaning "more
                    sensitive".
                </p>
            </v-card-text>
        </v-card>

        <div v-for="key in keys" class="key-calib" :key="key.number"
            :class="{valid: mode === 'auto' && key.pressure > 0}">
            <div class="key-number">{{ key.number }}</div>
            <div class="key-position" :class="{'key-top': key.position === 'top'}">
                <div class="key-slot"></div>
            </div>
            <label>Pressure</label>
            <input type="text" v-model.number="key.pressure" :class="{invalid: key.errors.pressure}"/>
            <label>Velocity</label>
            <input type="text" v-model.number="key.velocity" title="Velocity adjustment (-100 to 100)" :class="{invalid: key.errors.velocity}"/>
        </div>

        <v-card v-if="mode === 'manual'">
            <v-card-title><h2>Maximum Pressure Values</h2></v-card-title>
            <v-card-text>
                <p>The <b>Pressure</b> fields set the maximum pressure for each
                key, the allowed range is 0 - 3000</p>

                <p>If a key reacts too sensitive to pressure changes, then you
                can lower the number. If a key is not sensitive enough, use a
                higher number.</p>

                <p><kbd>Important:</kbd> it is normal for the keys to have different maximum pressure values due
                to variations in the sensors. When adjusting the values, make sure you trust your
                ears and not the numbers!</p>

                <p>To automatically determine the maximum pressure values for each key, you can start
                the detection process by clicking the button below. Then you can press each key on your
                keyboard to set the pressure value.</p>

                <v-btn color="primary" @click="startAutoCalibration">Scan Keyboard Pressure</v-btn>
            </v-card-text>
        </v-card>

        <v-card v-if="mode === 'auto'">
            <v-card-title>
                <h2>Maximum Pressure Values</h2>
            </v-card-title>
            <v-card-text>
                <p>Press each key on the keyboard with the maximum strength that you want to use during
                playing.</p>
                <p><b>Try to keep the applied pressure the same on all keys, best use the same finger for all keys.</b>
                This probably means that some keys are pushed in further than others.</p>

                <p>Once all keys were pressed, the <strong>Finish Scan</strong> button will be enabled.</p>
                <v-btn color="green" :disabled="validKeyCount < 24" @click="finishAutoCalibration">Finish Scan</v-btn>
                <v-btn class="ml-4" color="error" @click="abortAutoCalibration">Abort Scan</v-btn>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import API from '@/api.js'

function data () {
    return {
        keys: [],
        mode: 'manual',
        wsStatusLabel: 'Connecting...',
        wsConnected: false
    }
}

const computed = {
    validKeyCount () {
        var count = 0
        for (var i = 0; i < this.keys.length; i++) {
            if (this.keys[i].pressure > 0) {
                count++
            }
        }
        return count
    }
}

const methods = {
    keyPosition (idx) {
        if ([0, 2, 5, 7, 10, 12, 14, 17, 19, 22].indexOf(idx) >= 0) {
            return 'top'
        } else {
            return 'bottom'
        }
    },

    loadKeyData (keys) {
        for (var i = 0; i < keys.length; i++) {
            keys[i].position = this.keyPosition(i)
            keys[i].number = (i + 1)
            keys[i].errors = {}
        }
        this.keys = keys
    },

    saveKeyData () {
        var data = []

        for (var i = 0; i < this.keys.length; i++) {
            data.push({
                pressure: this.keys[i].pressure,
                velocity: this.keys[i].velocity
            })
            this.keys[i].errors = {}
        }

        API.saveKeyCalibration(data)
        .then((response) => {
            this.$store.dispatch('snacks/add', {
                message: 'Keyboard calibration saved successfully',
                timeout: 2000
            })
            this.loadKeyData(response.data)
        })
        .catch(({ response }) => {
            if (response.data.errors) {
                this.$store.dispatch('snacks/add', {
                    message: 'Unable to save keyboard calibration!',
                    type: 'error',
                    timeout: 4000
                })
                for (const [key, errors] of Object.entries(response.data.errors)) {
                    this.keys[key].errors = errors
                }
            }
        })
    },

    resetKeyCalibration () {
        if (!confirm('Are you sure you want to reset the key calibration to default values?')) {
            return
        }
        API.resetKeyCalibration().then((response) => {
            this.$store.dispatch('snacks/add', {
                message: 'Keyboard calibration reset to defaults',
                timeout: 2000
            })
            this.loadKeyData(response.data)
        })
    },

    startAutoCalibration () {
        this.savedValues = []
        for (var i = 0; i < this.keys.length; i++) {
            this.savedValues[i] = this.keys[i].pressure
            this.keys[i].pressure = 0
        }
        this.mode = 'auto'
        this.connectWebsocket()
    },

    abortAutoCalibration () {
        this.disconnectWebsocket()
        for (var i = 0; i < this.keys.length; i++) {
            this.keys[i].pressure = this.savedValues[i]
        }
        this.mode = 'manual'
    },

    finishAutoCalibration () {
        this.disconnectWebsocket()
        this.mode = 'manual'
    },

    connectWebsocket () {
        this.wsStatusLabel = 'Connecting...'
        this.ws = new WebSocket(API.getURL('MG_DATA_WS_URL'), 'keys')
        this.ws.onmessage = this.onWebSocketData
        this.ws.onclose = this.onWebSocketClose
        this.ws.onopen = this.onWebSocketOpen
        this.ws.binaryType = 'arraybuffer'
    },

    disconnectWebsocket () {
        if (this.ws) {
            this.ws.close()
            this.ws = undefined
        }
    },

    onWebSocketOpen () {
        this.wsStatusLabel = 'Connected'
        this.wsConnected = true
    },

    onWebSocketClose () {
        this.wsConnected = false
        this.wsStatusLabel = 'Not connected!'
    },

    onWebSocketData (msg) {
        var data = new Uint16Array(msg.data)
        for (var i = 0; i < data.length; i += 2) {
            var key = data[i]
            var pressure = data[i + 1]
            if (this.keys[key].pressure < pressure) {
                this.keys[key].pressure = pressure
            }
        }
    }
}

export default {
    name: 'key-calibration',
    data,
    methods,
    computed,

    created () {
        API.getKeyCalibration()
        .then((response) => {
            this.loadKeyData(response.data)
        })
    },

    destroyed () {
        this.disconnectWebsocket()
    }
}
</script>

<style scoped>
.key-calib {
    display: inline-block;
    text-align: center;
    margin-right: 1px;
    font-size: 80%;
    margin-bottom: 2em;
    padding-top: 1em;
    border-top: 1px solid #ddd;
    background-color: #ddd;
}

.theme--dark .key-calib {
    background-color: darkslategrey;
}

.theme--dark .key-calib:hover {
    background-color: slategrey !important;
}

.theme--dark .key-calib.valid {
    background-color: darkgreen !important;
}

.key-calib.valid {
    background-color: lightgreen !important;
}

input.invalid {
    background-color: red !important;
    color: white;
}

.key-calib:hover {
    background-color: #eee !important;
}

.key-calib input {
    display: block;
    margin: 0.2em 0;
}

.key-calib label {
    font-size: 80%;
    margin: 0;
    margin-top: 1em;
    padding: 0;
}

.key-number {
    padding-bottom: 0.4em;
}

.key-position {
    height: 5em;
    padding-top: 2em;
}

.key-position.key-top {
    padding-top: 0em;
}

.key-slot {
    margin-left: auto;
    margin-right: auto;
    width: 2em;
    height: 2em;
    background: #bbb;
    border: 1px solid #aaa;
    box-shadow: 0px 0px 0px 1px #888;
    border-radius: 2px;
}

.key-position.key-top .key-slot {
    background: #333;
    border: 1px solid #666;
    box-shadow: 0px 0px 0px 1px #888;
}

thead th {
    text-align: center;
}

tbody tr td:nth-child(2) {
    min-width: 6em;
}

tbody tr td:last-child {
    text-align: right;
}

.key-calib input {
    width: 4em;
    text-align: center;
}

.legend {
    border-top: 0;
    background-color: inherit;
}

.legend > label {
    display: block;
    padding: 0.3em;
    margin: 0;
}

.card {
    margin-bottom: 1em;
}
</style>
