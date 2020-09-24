<template>
    <v-row no-gutters style="flex-wrap: nowrap;" :class="{'muted': muted || disabled}">
        <v-col cols="2" class="flex-grow-0 flex-shrink-0" style="min-width: 7em">
            <template v-if="showMute">
                <v-btn small icon @click="$emit('update:muted', !muted)">
                    <v-icon color="grey" v-if="muted">volume_off</v-icon>
                    <v-icon v-else>volume_up</v-icon>
                </v-btn>
            </template>
            {{ title }}
        </v-col>
        <v-col :cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 50px; max-width: 100%">
            <v-slider
                :disabled="disabled"
                :value="volumePercent"
                @input="setVolume($event)"
                dense
                tabindex="-1"
                />
        </v-col>
        <v-col cols="1" class="flex-grow-0 flex-shrink-1" style="min-width: 3em">
            <v-text-field
                :disabled="disabled"
                :value="volumePercent"
                @change="setVolume($event)"
                type="number"
                class="mr-4"
                dense
                />
        </v-col>
        <template v-if="showBalance">
            <v-col cols="1" class="flex-grow-1 flex-shrink-0"
            style="min-width: 50px; max-width: 20%"
            >
                <mg-slider
                    :disabled="disabled"
                    v-on:dblclick.native="setBalance(0)"
                    center="0"
                    min="-100"
                    max="100"
                    :value="balancePercent"
                    @input="setBalance($event)"
                    tabindex="-1"
                    :thumbColor="balancePercent === 0 ? '#999' : 'primary'"
                    />
            </v-col>
            <v-col cols="1" class="flex-grow-0 flex-shrink-1" style="min-width: 3em">
                <v-text-field
                    :disabled="disabled"
                    :value="balancePercent"
                    @change="setBalance($event)"
                    type="number"
                    class="mr-4"
                    dense
                    />
            </v-col>
        </template>
    </v-row>
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
