<template>
    <v-container fluid>
        <mg-toolbar title="Wheel Calibration"/>

        <v-layout row wrap>
            <v-flex xs12>
                <v-card>
                    <v-card-text>
                        <p class="wheel-gain" :class="gainClass()">Wheel Gain: {{ gain }}</p>
                        <p>The wheel gain should be between 13 and 27. If it is lower, then
                        the magent on the axle is too close to the sensor. If it is higher,
                        then the magnet is too far away from the sensor. In these cases, loosen
                        the small screws on both bearings and move the axle until the gain is
                        in the good range again, then tighten the screws again.</p>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<style>
    .wheel-gain {
        font-weight: bold;
        font-size: 200%;
    }

    .gain-error {
        color: red
    }

    .gain-warning {
        color: orange
    }

    .gain-good {
        color: green
    }
</style>

<script>
import API from '@/api'

function data () {
    return {
        gain: 0,
        update: true,
        interval: 1000
    }
}

const methods = {
    gainClass () {
        if (this.gain < 13 || this.gain > 27) {
            return 'gain-error'
        } else {
            return 'gain-good'
        }
    },

    updateGain () {
        API.fetchWheelGain().then((response) => {
            this.gain = response.data.gain

            if (this.timeout) {
                clearTimeout(this.timeout)
                this.timeout = null
            }

            if (this.update) {
                this.timeout = setTimeout(this.updateGain, this.interval)
            }
        })
    }
}

export default {
    name: 'wheel-calibrate',
    data,
    methods,

    created () {
        this.timeout = null
        this.updateGain()
    },

    destroyed () {
        this.update = false
        if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
        }
    }
}
</script>
