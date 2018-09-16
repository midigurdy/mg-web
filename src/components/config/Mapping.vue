<template>
<v-container fluid grid-list-md>
    <mg-toolbar title="Sensor Mappings">
        <v-spacer/>
        <v-toolbar-items>
        </v-toolbar-items>
    </mg-toolbar>

    <v-layout row>
        <v-flex md3>
            <v-card>
            <v-card-title><h2>Mappings</h2></v-card-title>
                <v-list>
                    <template v-for="group, i in mapLinks">
                    <v-subheader><b>{{ group.name }} to ...</b></v-subheader>
                    <v-list-tile v-for="link in group.links" :key="link.id" :to="{name: 'config-mapping', params: {mapname: link.id}}">
                        <v-list-tile-title>
                            {{ link.name }}
                        </v-list-tile-title>
                    </v-list-tile>
                    <v-divider v-if="i < mapLinks.length -1"/>
                    </template>
                </v-list>
            </v-card>
        </v-flex>
        <v-flex md8>
            <v-card>
                <v-card-title><h2>{{ mapping.name }}</h2></v-card-title>
                <svg></svg>
            </v-card>
            <v-card class="mapping-tools">
                <v-btn :loading="busy" flat color="primary" :disabled="ranges.length === 0" :icon="$vuetify.breakpoint.xs" @click="saveRanges">
                    <v-icon left>done</v-icon> <span class="hidden-xs-only">Save</span>
                </v-btn>
                <v-btn flat :disabled="!dirty" :icon="$vuetify.breakpoint.xs" @click="getMapping">
                    <v-icon left>cached</v-icon> <span class="hidden-xs-only">Discard Changes</span>
                </v-btn>
                <v-btn flat :icon="$vuetify.breakpoint.xs" @click="resetMapping">
                    <v-icon left>settings</v-icon> <span class="hidden-xs-only">Reset To Factory Default</span>
                </v-btn>
            </v-card>
        </v-flex>
        <v-flex md3>
            <v-card class="mapping-values">
                <v-card-title><h2>Values</h2></v-card-title>
                <table class="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>{{ mapping.src.name }}</th>
                            <th>{{ mapping.dst.name }}</th>
                        </tr>
                    </thead>
                    <tbody name="list" is="transition-group">
                        <tr v-for="(range, index) in ranges" :key="rangeKey(range)">
                            <td>
                                <v-btn flat icon small @click="addRange(index)" :tabindex="-1"
                                  title="Add control point below"
                                 ><v-icon>control_point</v-icon></v-btn>
                                <v-btn flat icon small @click="removeRange(index)" :tabindex="-1"><v-icon>remove</v-icon></v-btn>
                            </td>
                            <td><v-text-field class="number-field" hide-details type="number" :value="range.src" @change="onValueChange($event, index, 'src')"/></td>
                            <td><v-text-field class="number-field" hide-details type="number" :value="range.dst" @change="onValueChange($event, index, 'dst')"/></td>
                        </tr>
                        <tr v-if="ranges.length === 0" key="empty">
                            <td>
                                <v-btn icon @click="addRange(-1)"><v-icon>add</v-icon></v-btn>
                            </td>
                            <td colspan="2"></td>
                        </tr>
                    </tbody>
                </table>
            </v-card>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import * as d3 from 'd3'
import API from '@/api'

const height = 400
const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
}

const mapConfig = {
    pressure_to_poly: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 2
        }
    },
    pressure_to_pitch: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 2
        }
    },
    speed_to_melody_volume: {
        websocket: {
            name: 'wheel',
            packetSize: 4,
            packetIndex: 1
        }
    },
    speed_to_drone_volume: {
        websocket: {
            name: 'wheel',
            packetSize: 4,
            packetIndex: 1
        }
    },
    speed_to_trompette_volume: {
        websocket: {
            name: 'wheel',
            packetSize: 4,
            packetIndex: 1
        }
    },
    speed_to_chien: {
        websocket: {
            name: 'wheel',
            packetSize: 4,
            packetIndex: 3
        }
    },
    keyvel_to_notevel: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 3
        }
    },
    keyvel_to_tangent: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 3
        }
    },
    keyvel_to_keynoise: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 3
        }
    }
}

var rangeKey = 0

function data () {
    return {
        busy: false,
        mapping: {
            name: 'Undefined',
            src: { name: 'Undefined', min: 0, max: 0 },
            dst: { name: 'Undefined', min: 0, max: 0 }
        },
        ranges: [],
        dirty: false
    }
}

const watch = {
    mapname: 'getMapping',
    ranges: {
        handler: 'updateChart',
        deep: true
    },
    '$route' () {
        this.getMapping()
    }
}

const computed = {
    mapLinks () {
        return [
            {
                name: 'Wheel Speed',
                links: [
                    {
                        'id': 'speed_to_melody_volume',
                        'name': 'Melody Volume'
                    },
                    {
                        'id': 'speed_to_drone_volume',
                        'name': 'Drone Volume'
                    },
                    {
                        'id': 'speed_to_trompette_volume',
                        'name': 'Trompette Volume'
                    },
                    {
                        'id': 'speed_to_chien',
                        'name': 'Chien Volume'
                    }
                ]
            },
            {
                name: 'Key Pressure',
                links: [
                    /*
                    {
                        'id': 'pressure_to_poly',
                        'name': 'Aftertouch'
                    },
                    */
                    {
                        'id': 'pressure_to_pitch',
                        'name': 'Pitch Bend'
                    }
                ]
            },
            {
                name: 'Key Velocity',
                links: [
                    {
                        'id': 'keyvel_to_tangent',
                        'name': 'Tangent Hit Volume'
                    },
                    {
                        'id': 'keyvel_to_keynoise',
                        'name': 'Keynoise Volume'
                    },
                    {
                        'id': 'keyvel_to_notevel',
                        'name': 'Keyboard Mode Volume'
                    }
                ]
            }
        ]
    },

    mapname () {
        return this.$route.params.mapname
    },

    /* Following are all chart related properties */
    svg () {
        return d3.select(this.$el).select('svg')
    },

    chartWidth () {
        return parseInt(this.svg.style('width'), 10) - margin.left - margin.right
    },

    chartHeight () {
        return height - margin.top - margin.bottom
    },

    chartScales () {
        var x = d3.scaleLinear()
            .rangeRound([0, this.chartWidth])
            .domain([this.mapping.src.min, this.mapping.src.max])
        var y = d3.scaleLinear()
            .rangeRound([this.chartHeight, 0])
            .domain([this.mapping.dst.min, this.mapping.dst.max])
        return {x, y}
    },

    chartLine () {
        var scale = this.chartScales
        return d3.line()
            .x((d) => { return scale.x(d.src) })
            .y((d) => { return scale.y(d.dst) })
    },

    chartDragBehaviour () {
        var scale = this.chartScales
        return d3.drag()
            .on('drag', (d, i) => {
                var rx = parseInt(scale.x.invert(d3.event.x), 10)
                var ry = parseInt(scale.y.invert(d3.event.y), 10)
                this.ranges[i]['src'] = this.updateValue(i, 'src', parseInt(rx, 10))
                this.ranges[i]['dst'] = this.updateValue(i, 'dst', parseInt(ry, 10))
            })
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

    /* Callback for range input fields */
    onValueChange (val, idx, side) {
        val = this.updateValue(idx, side, val)
        this.ranges[idx][side] = val
    },

    /* Update range values with bounds checking */
    updateValue (idx, side, val) {
        var target = this.mapping[side]
        val = parseInt(val, 10)
        if (side === 'src') {
            /* X values should not be allowed to move past their neighbours */
            if (idx > 0 && val <= this.ranges[idx - 1][side]) {
                val = this.ranges[idx - 1][side] + 1
            }
            if (idx < this.ranges.length - 1 && val >= this.ranges[idx + 1][side]) {
                val = this.ranges[idx + 1][side] - 1
            }
        }
        if (!val) {
            val = target.min
        } else if (val < target.min) {
            val = target.min
        } else if (val > target.max) {
            val = target.max
        }
        this.dirty = true
        return val
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

    removeRange (idx) {
        this.ranges.splice(idx, 1)
    },

    /* Copy ranges from store into local data, so we can edit locally and
       only commit on save */
    getMapping () {
        this.disconnectWebsocket()
        API.getMapping(this.mapname)
        .then(this.loadMapping)
    },

    /* Copy ranges from store into local data, so we can edit locally and
       only commit on save */
    loadMapping (response) {
        this.mapping = response.data
        this.mapConfig = mapConfig[this.mapname]
        rangeKey = 0

        // store this separately, to make watching easier
        this.ranges = this.mapping.ranges
        this.dirty = false

        /* This gets called whenever a mapping changes (i.e. a change in mapname),
        so clear the chart and setup with new mapping values */
        this.setupChart()
        if (this.mapConfig.websocket) {
            this.connectWebsocket(this.mapConfig.websocket.name)
        }
    },

    resetMapping () {
        API.resetMapping(this.mapname)
        .then(this.loadMapping)
        .then(() => {
            this.$store.dispatch('snacks/add', {
                message: 'Mapping has been reset to factory defaults',
                timeout: 2000
            })
        })
    },

    /* Save local edits back to store */
    saveRanges () {
        this.busy = true
        API.updateRanges(this.mapname, this.ranges)
        .then(response => {
            this.busy = false
            this.dirty = false
            this.mapping = response.data
            this.ranges = this.mapping.ranges
            this.$store.dispatch('snacks/add', {
                message: 'Mapping has been saved',
                timeout: 2000
            })
        })
        .catch(() => {
            this.busy = false
        })
    },

    /* Renders the whole D3 chart */
    setupChart () {
        // Clear everything in chart
        this.svg.selectAll('g').remove()

        // If we have no mapping yet, don't render anything
        if (!this.mapping) return

        var scale = this.chartScales
        var height = this.chartHeight

        // Setup outer margins
        var g = this.svg
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        // Setup axes, x axis at bottom, y axis on left
        g.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(scale.x))

        g.append('g')
            .call(d3.axisLeft(scale.y))

        g.append('text')
            .attr('transform', 'translate(' + (this.chartWidth / 2) + ',' + (height + (margin.bottom / 1.2)) + ')')
            .text(this.mapping.src.name)

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text(this.mapping.dst.name)

        // Draw zero line if y is not zero based
        if (this.mapping.dst.min < 0) {
            g.append('path')
                .attr('class', 'zeroline')
                .attr('fill', 'none')
                .attr('stroke', 'grey')
                .attr('stroke-linejoin', 'round')
                .attr('stroke-linecap', 'round')
                .attr('stroke-dasharray', '5')
                .attr('stroke-width', 1)
                .attr('d', 'M 0 ' + scale.y(0) + ' H ' + this.chartWidth)
        }

        // Setup the raw line path
        g.append('path')
            .attr('class', 'srcline')
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 2)
            .attr('d', 'M 0 0 V ' + height)

        // Setup the line path
        g.append('path')
            .attr('class', 'mapline')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 2)

        // Now render the circles and lines with proper values
        this.updateChart()
    },

    /* Update the D3 chart if ranges change. Only updates lines and circles */
    updateChart () {
        var scale = this.chartScales
        var g = this.svg.select('g')

        var circles = g.selectAll('.point')
            .data(this.ranges)
            .attr('cx', function (d) { return scale.x(d.src) })
            .attr('cy', function (d) { return scale.y(d.dst) })

        circles.enter()
            .append('circle')
            .attr('class', 'point')
            .attr('fill', 'rgba(0, 0, 255, 0.5)')
            .attr('stroke', 'blue')
            .attr('stroke-width', 3)
            .attr('r', 20)
            .attr('cx', function (d) { return scale.x(d.src) })
            .attr('cy', function (d) { return scale.y(d.dst) })
            .call(this.chartDragBehaviour)

        circles.exit()
            .remove()

        g.select('.mapline')
            .datum(this.ranges)
            .attr('d', this.chartLine)
    },

    updateSourceValue (val) {
        var g = this.svg.select('g')
        var scale = this.chartScales

        g.select('.srcline')
            .attr('transform', 'translate(' + scale.x(val) + ', 0)')
    },

    connectWebsocket (name) {
        this.disconnectWebsocket()
        this.wsStatusLabel = 'Connecting...'
        this.ws = new WebSocket(API.getURL('MG_DATA_WS_URL'), name)
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
        var packetIndex = this.mapConfig.websocket.packetIndex
        var packetSize = this.mapConfig.websocket.packetSize

        var data = new Uint16Array(msg.data)
        var val = 0
        for (var i = 0; i < data.length; i += packetSize) {
            val = data[i + packetIndex]
        }
        this.updateSourceValue(val)
    }
}

export default {
    name: 'mapping',
    watch,
    computed,
    methods,
    data,

    mounted () {
        this.getMapping()
        this.setupChart()
    },

    destroyed () {
        this.disconnectWebsocket()
    }
}
</script>

<style scoped>
svg {
    width: 100%;
    height: 400px;
}

.table thead th {
    text-align: center;
    white-space: unset;
}

table tr:hover td {
    background-color: #eee;
}

.table tbody td:first-child {
    padding: 0 0 0 4px;
    white-space: nowrap;
}

.table tbody td .btn {
    margin: 0;
}

.table tbody tr {
    border-bottom: 0 !important;
}

.mapping-values {
    padding-bottom: 2em;
}

.list-enter-active {
  animation: fadein 0.6s ease-in;
}

.list-leave-active {
   transition: none;
   animation: none;
}

@keyframes fadein {
  0% {opacity: 0;}
  100% { opacity: 1;}
}
@keyframes fadeout {
  0% {opacity: 1; }
  100% { opacity: 0; }
}

.mapping-tools {
    margin-top: 5px;
}
</style>