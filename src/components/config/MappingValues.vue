<template>
    <div>
        <mapping-value-row 
            v-for="(range, index) in ranges" :key="rangeKey(range)"
            :range="range"
            :index="index"
            @removeRange="removeRange($event)"
            @addRange="addRange($event)"
            />
        <v-row v-if="ranges.length === 0">
            <v-flex xs4>
                <v-btn icon @click="addRange(-1)"><v-icon>add</v-icon></v-btn>
            </v-flex>
        </v-row>
    </div>
</template>

<script>
import MappingValueRow from '@/components/config/MappingValueRow'

var rangeKey = 0

function data () {
    return {
    }
}

const methods = {
    rangeKey (range) {
        if (!range) return
        if (!range.key) {
            rangeKey++
            range.key = 'rk' + rangeKey
        }
        return range.key
    },

    removeRange (idx) {
        this.ranges.splice(idx, 1)
    },

    addRange (idx) {
        if (idx === -1 || this.ranges.length < 2) {
            this.ranges.push({src: 0, dst: 0, key: 'rk' + ++rangeKey})
        } else {
            if (idx === (this.ranges.length - 1)) {
                idx = this.ranges.length - 2
            }
            var addsrc = Math.round((this.ranges[idx + 1].src - this.ranges[idx].src) / 2)
            var adddst = Math.round((this.ranges[idx + 1].dst - this.ranges[idx].dst) / 2)
            var src = this.ranges[idx].src + addsrc
            var dst = this.ranges[idx].dst + adddst
            var found = false
            for (var i = 0; i < this.ranges.length; i++) {
                if (this.ranges[i].src === src) {
                    found = true
                    break
                }
            }
            if (!found) {
                this.ranges.splice(idx + 1, 0, {src, dst, key: 'rk' + ++rangeKey})
            }
        }
        this.ranges.sort((a, b) => {
            return a.src - b.src
        })
    },
}

export default {
    name: 'mapping-values',
    components: { MappingValueRow },
    props: ['ranges'],
    methods,
    data,
}
</script>
