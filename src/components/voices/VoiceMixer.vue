<template>
    <div class="layout row wrap" :class="{'muted': muted || disabled}">
        <div class="flex xs12 sm3">
            <template v-if="showMute">
                <v-btn small icon @click="$emit('update:muted', !muted)">
                    <v-icon color="grey" v-if="muted">volume_off</v-icon>
                    <v-icon v-else>volume_up</v-icon>
                </v-btn>
            </template>
            {{ title }}
        </div>
        <div class="flex xs4 sm4">
            <v-slider
                :disabled="disabled"
                :value="volumePercent"
                @input="setVolume($event)"
                tabindex="-1"
                />
        </div>
        <div class="flex xs2 sm1">
            <v-text-field
                :disabled="disabled"
                :value="volumePercent"
                @change="setVolume($event)"
                type="number"/>
        </div>
        <template v-if="showBalance">
            <div class="flex xs4 sm3">
                <mg-slider
                    :disabled="disabled"
                    v-on:dblclick.native="setBalance(0)"
                    center="0"
                    min="-100"
                    max="100"
                    :value="balancePercent"
                    @input="setBalance($event)"
                    tabindex="-1"
                    />
            </div>
            <div class="flex xs2 sm1">
                <v-text-field
                    :disabled="disabled"
                    :value="balancePercent"
                    @change="setBalance($event)"
                    type="number"
                    />
            </div>
        </template>
    </div>
</template>

<style scoped>
.flex .input-group {
    padding: 0
}
.flex .input-group--slider {
    padding-left: 10px;
    padding-right: 20px;
}

.layout .flex {
    padding: 0 !important;
}

.muted {
    opacity: 0.5;
}
</style>

<script>
import MgSlider from '@/components/MgSlider'

const computed = {
    volumePercent () {
        return parseInt((this.volume / 127) * 100, 10)
    },

    balancePercent () {
        var balance = this.balance - 64
        if (balance < 0) {
            balance = parseInt(balance / 64 * 100, 10)
        } else if (balance > 0) {
            balance = parseInt(balance / 63 * 100, 10)
        }
        return balance
    },

    err () {
        return this.errors ? this.errors : {}
    },

    hasError () {
        return !!this.errors
    }
}

const methods = {
    setVolume (percent) {
        percent = Math.min(100, Math.max(0, percent))
        this.$emit('update:volume', parseInt((percent / 100) * 127, 10))
    },

    setBalance (val) {
        val = parseInt(val, 10)
        var balance = 64
        if (val < 0) {
            balance = parseInt(64 / 100 * (100 + val), 10)
        } else if (val > 0) {
            balance = 64 + parseInt(63 / 100 * val, 10)
        }
        this.$emit('update:balance', balance)
    }
}

export default {
    name: 'voice-mixer',
    computed,
    methods,
    components: { MgSlider },
    props: [
        'errors',
        'title',
        'muted',
        'volume',
        'disabled',
        'balance',
        'showMute',
        'showBalance'
    ]
}
</script>
