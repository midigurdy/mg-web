<template>
<v-container grid-list-md fluid>
    <mg-toolbar title="Sensor Mappings"></mg-toolbar>

    <v-layout row>
        <v-flex md3>
            <template v-for="group in mapLinks">
            <v-card class="mb-2" :key="group.name">
                <v-card-title><h3><v-icon v-if="group.icon">{{ group.icon }}</v-icon> {{ group.name }}</h3></v-card-title>
                <v-list>
                    <v-list-item v-for="link in group.links" :key="link.id" :to="{name: 'config-mapping', params: {mapname: link.id}}">
                        <v-list-item-title>
                            {{ link.name }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-card>
            </template>
        </v-flex>
        <v-flex md6>
            <v-card>
                <v-card-title><h2>{{ mapping.name }}</h2></v-card-title>
                <svg></svg>
            </v-card>
            <v-card class="mt-2 mb-2">
                <v-card-text>
                    <v-btn text color="primary" :disabled="busy || ranges.length === 0" @click="saveRanges">
                        <v-icon left>done</v-icon> Save
                    </v-btn>
                    <v-btn text :disabled="!dirty" @click="resetMapping">
                        <v-icon left>cached</v-icon> Discard Changes
                    </v-btn>
                    <v-btn text @click="factoryResetMapping">
                        <v-icon left>settings</v-icon> Reset To Factory Default
                    </v-btn>
                </v-card-text>
            </v-card>
            <v-expansion-panels v-if="mapConfig && mapConfig.description" :value="0">
                <v-expansion-panel>
                    <v-expansion-panel-header>{{ mapConfig.description }}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <div v-html="mapConfig.Description"></div>
                        <div v-html="mapConfig.longDescription"></div>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-flex>
        <v-flex md3>
            <v-card>
                <v-card-title><h2>Values</h2></v-card-title>
                <v-card-text>
                <v-row>
                    <v-flex xs4></v-flex>
                    <v-flex xs4 class="text-center">{{ mapping.src.name }}</v-flex>
                    <v-flex xs4 class="text-center">{{ mapping.dst.name }}</v-flex>
                </v-row>
                <mapping-values :ranges="ranges"/>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import * as d3 from 'd3'
import API from '@/api'
import { debounce, throttle } from 'lodash'

import MappingValues from '@/components/config/MappingValues'

const height = 400
const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 70
}

const mapConfig = {
    chien_threshold_to_range: {
        description: 'Changes the hardness of the chien based on the chien sensitivity',
        longDescription: `
            <p>Controls how the chien response changes for different sensitivity values. Negative
            values have the effect of making the chien attack softer, positive
            values make the chien attack harder.</p>
            <p>The <span style="color: orange">orange line</span> shows the current value of the chien sensitivity.</p>
        `,
        xFormat: {
            ticks: 10,
            format: 's'
        },
        storeField: 'firstChienThreshold',
        rawLineColour: 'orange'
    },
    pressure_to_poly: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 2
        },
        rawLineColour: 'green'
    },
    pressure_to_pitch: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 2
        },
        rawLineColour: 'green',
        description: 'Controls the amount of pitch bend in response to key pressure.',
        longDescription: `
            <p>Maps the pressure you apply on the keys to the amount and direction of the pitch bend
            (which affects the fine tuning of the sound). Positive values make the sound higher,
            negative values make the sound lower.</p>
            <p>The <span style="color: green">green line</span> shows the current pressure on the highest pressed key.</p>
        `
    },
    speed_to_melody_volume: {
        websocket: {
            name: 'wheel',
            packetSize: 4,
            packetIndex: 1
        },
        rawLineColour: 'red',
        description: 'Controls the volume response of the melody strings in reaction to the wheel speed.',
        longDescription: `
            <p>The <span style="color: red">red line</span> indicates the current speed of the wheel.</p>
        `
    },
    speed_to_drone_volume: {
        websocket: {
            name: 'wheel',
            packetSize: 4,
            packetIndex: 1
        },
        rawLineColour: 'red',
        description: 'Controls the volume response of the drone strings in reaction to the wheel speed.',
        longDescription: `
            <p>The <span style="color: red">red line</span> indicates the current speed of the wheel.</p>
        `
    },
    speed_to_trompette_volume: {
        websocket: {
            name: 'wheel',
            packetSize: 4,
            packetIndex: 1
        },
        rawLineColour: 'red',
        description: 'Controls the volume response of the trompette strings in reaction to the wheel speed.',
        longDescription: `
            <p>The <span style="color: red">red line</span> indicates the current speed of the wheel.</p>
        `
    },
    speed_to_chien: {
        websocket: {
            name: 'wheel',
            packetSize: 4,
            packetIndex: 3
        },
        rawLineColour: 'red',
        description: 'Controls the volume of the chien (buzzing) in reaction to the wheel speed.',
        longDescription: `
            <p><b>Please note:</b> this only applies to trompette strings in "MidiGurdy" mode. For trompettes
            in "Percussion" mode, please use the "Percussion Mode Response" mapping.</p>
            <p>The <span style="color: red">red line</span> shows the current wheel speed, when a coup would actually sound.</p>
        `
    },
    speed_to_percussion: {
        websocket: {
            name: 'wheel',
            packetSize: 4,
            packetIndex: 3
        },
        rawLineColour: 'red',
        description: 'Controls the volume of the chien sound for trompette strings in Percussion mode.',
        longDescription: `
            <p>Please note that this mapping only affects the <b>initial</b> sound volume.
            Once the sound has started, the volume is not changed anymore. So only the attack of your coup has an effect
            here, not how fast you turn after starting the coup.</p>
            <p>The <span style="color: red">red line</span> shows the level of attack of your last coup.</p>
        `
    },
    keyvel_to_notevel: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 3,
            match: {
                index: 4,
                compare: 1,
            },
        },
        rawLineColour: 'green',
        description: 'Controls the volume of the melody sounds in Keyboard mode.',
        longDescription: `
            <p>This only applies to melody strings in "Keyboard" mode. It controls the initial volume of
            the sound in response to the key velocity, i.e. how fast and hard you press the keys.</p>
            <p>The <span style="color: green">green line</span> show the last key press speed.</p>
        `
    },
    keyvel_to_tangent: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 3,
            match: {
                index: 4,
                compare: 1,
            },
        },
        rawLineColour: 'green',
        description: 'Controls the volume of the tangent noise sounds for melody strings.',
        longDescription: `
            <p>Controls the volume of the tangent noise sounds for melody strings in response to
            how fast you press the keys. Please note that not all MidiGurdy soundfonts react to this
            control.</p>
            <p>The <span style="color: green">green line</span> show the last key press speed.</p>
        `
    },
    keyvel_to_keynoise: {
        websocket: {
            name: 'keys',
            packetSize: 5,
            packetIndex: 3
        },
        rawLineColour: 'green',
        description: `
            Controls the key noise volume in response to how fast you press or release the keys.
        `,
        longDescription: `
            <p>The <span style="color: green">green line</span> show the last key press speed.</p>
        `
    }
}

function data () {
    return {
        busy: false,
        mapping: {
            name: 'Undefined',
            src: { name: 'Undefined', min: 0, max: 0 },
            dst: { name: 'Undefined', min: 0, max: 0 }
        },
        ranges: [],
        dirty: false,
        showDescription: true,
        mapConfig: null,
        storeField: null
    }
}

const watch = {
    mapname: 'getMapping',
    ranges: {
        handler: function () {
            this.updateChart()
            if (this.dirty) {
                this.setRanges()
            }
        },
        deep: true
    },
    storeValue (val) {
        this.updateSourceValue(val)
    }
}

const computed = {
    mapLinks () {
        return [
            {
                name: 'Melody',
                icon: 'music_note',
                links: [
                    {
                        'id': 'speed_to_melody_volume',
                        'name': 'Volume Response'
                    },
                    {
                        'id': 'pressure_to_pitch',
                        'name': 'Pitch Bend'
                    },
                    {
                        'id': 'keyvel_to_notevel',
                        'name': 'Keyboard Mode Volume'
                    }
                ]
            },
            {
                name: 'Drone',
                icon: 'music_note',
                links: [
                    {
                        'id': 'speed_to_drone_volume',
                        'name': 'Volume Response'
                    }
                ]
            },
            {
                name: 'Trompette',
                icon: 'music_note',
                links: [
                    {
                        'id': 'speed_to_trompette_volume',
                        'name': 'Volume Response'
                    },
                    {
                        'id': 'speed_to_chien',
                        'name': 'Chien Response'
                    },
                    {
                        'id': 'chien_threshold_to_range',
                        'name': 'Sensitivity / Hardness'
                    },
                    {
                        'id': 'speed_to_percussion',
                        'name': 'Percussion Mode Response'
                    }
                ]
            },
            {
                name: 'Key Noise',
                icon: 'music_note',
                links: [
                    {
                        'id': 'keyvel_to_tangent',
                        'name': 'Tangent Hit Volume'
                    },
                    {
                        'id': 'keyvel_to_keynoise',
                        'name': 'Key Noise Volume'
                    }
                ]
            }
        ]
    },

    storeValue () {
        if (this.storeField === 'firstChienThreshold') {
            return this.$store.getters.firstChienThreshold
        }
        return null
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

    colors () {
        // setup theme colors
        if (this.$store.state.ui.darkTheme) {
            return {
                mapLine: 'white',
                circleStoke: 'rgb(25, 118, 210)',
                circleFill: 'rgba(25, 118, 210, 0.5)',
                zeroLine: 'grey',
                axisText: 'white',
                axisColour: 'lightgrey'

            }
        } else {
            return {
                mapLine: 'steelblue',
                circleStoke: 'blue',
                circleFill: 'rgba(0, 0, 255, 0.5)',
                zeroLine: 'grey',
                axisText: 'black',
                axisColour: 'darkgrey'
            }
        }
    }
}

const methods = {
    onResize () {
        this.setupChart()
    },

    getchartWidth () {
        return parseInt(this.svg.style('width'), 10) - margin.left - margin.right
    },

    /* Callback for range input fields */
    onValueChange (val, idx, side) {
        val = this.updateValue(idx, side, val)
        this.ranges[idx][side] = val
    },

    updateChartScales () {
        var x = d3.scaleLinear()
            .rangeRound([0, this.getchartWidth()])
            .domain([this.mapping.src.min, this.mapping.src.max])
        var y = d3.scaleLinear()
            .rangeRound([this.chartHeight, 0])
            .domain([this.mapping.dst.min, this.mapping.dst.max])
        this._chartScales = {x, y}
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
        if (Number.isNaN(val)) {
            val = target.min
        } else if (val < target.min) {
            val = target.min
        } else if (val > target.max) {
            val = target.max
        }
        this.dirty = true
        return val
    },

    /* Copy ranges from store into local data, so we can edit locally and
       only commit on save */
    getMapping () {
        this.disconnectWebsocket()
        API.getMapping(this.mapname)
        .then((response) => {
            this.loadMapping(response)
            this.dirty = this.mapping.temporary
        })
    },

    /* Copy ranges from store into local data, so we can edit locally and
       only commit on save */
    loadMapping (response) {
        this.mapping = response.data
        this.mapConfig = mapConfig[this.mapname]

        // store this separately, to make watching easier
        this.ranges = this.mapping.ranges
        this.dirty = false
        this.storeField = null

        /* This gets called whenever a mapping changes (i.e. a change in mapname),
        so clear the chart and setup with new mapping values */
        this.setupChart()
        if (this.mapConfig.websocket) {
            this.connectWebsocket(this.mapConfig.websocket.name)
        } else if (this.mapConfig.storeField) {
            this.storeField = this.mapConfig.storeField
            this.updateSourceValue(this.storeValue)
        }
    },

    resetMapping () {
        API.resetMapping(this.mapname)
        .then(this.loadMapping)
        .then(() => {
            this.$store.dispatch('snacks/add', {
                message: 'Mapping has been reset to saved values',
                timeout: 2000
            })
        })
    },

    factoryResetMapping () {
        API.factoryResetMapping(this.mapname)
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
        API.saveRanges(this.mapname, this.ranges)
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

    setRanges () {
        if (this.busy || this.ranges.length < 1) return
        this.busy = true
        API.updateRanges(this.mapname, this.ranges)
        .then(() => {
            this.busy = false
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
        if (!this.mapping || !this.mapConfig) return

        this.updateChartScales()

        var scale = this._chartScales
        var height = this.chartHeight

        // Setup outer margins
        var g = this.svg
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        // Setup axes, x axis at bottom, y axis on left
        var xAxis = d3.axisBottom(scale.x)
        if (this.mapConfig.xFormat) {
            xAxis = xAxis.ticks(this.mapConfig.xFormat.ticks, this.mapConfig.xFormat.format)
        }

        g.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
            .attr('stroke', this.colors.axisColour)

        g.append('g')
            .call(d3.axisLeft(scale.y))
            .attr('stroke', this.colors.axisColour)

        g.append('text')
            .attr('transform', 'translate(' + (this.getchartWidth() / 2) + ',' + (height + (margin.bottom / 1.2)) + ')')
            .attr('fill', this.mapConfig.rawLineColour || this.colors.axisText)
            .text(this.mapping.src.name)

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + 10)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .attr('fill', this.colors.axisText)
            .style('text-anchor', 'middle')
            .text(this.mapping.dst.name)

        // Draw zero line if y is not zero based
        if (this.mapping.dst.min < 0) {
            g.append('path')
                .attr('class', 'zeroline')
                .attr('fill', 'none')
                .attr('stroke', this.colors.zeroLine)
                .attr('stroke-linejoin', 'round')
                .attr('stroke-linecap', 'round')
                .attr('stroke-dasharray', '5')
                .attr('stroke-width', 1)
                .attr('d', 'M 0 ' + scale.y(0) + ' H ' + this.getchartWidth())
        }

        // Setup the raw line path
        if (this.mapConfig.rawLineColour) {
            g.append('path')
                .attr('class', 'srcline')
                .attr('fill', 'none')
                .attr('stroke', this.mapConfig.rawLineColour)
                .attr('stroke-linejoin', 'round')
                .attr('stroke-linecap', 'round')
                .attr('stroke-width', 2)
                .attr('d', 'M 0 0 V ' + height)
        }

        // Setup the line path
        g.append('path')
            .attr('class', 'mapline')
            .attr('fill', 'none')
            .attr('stroke', this.colors.mapLine)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 2)

        // Now render the circles and lines with proper values
        this.updateChart()
    },

    /* Update the D3 chart if ranges change. Only updates lines and circles */
    updateChart () {
        var scale = this._chartScales
        var g = this.svg.select('g')

        var circles = g.selectAll('.point')
            .data(this.ranges)
            .attr('cx', function (d) { return scale.x(d.src) })
            .attr('cy', function (d) { return scale.y(d.dst) })

        var chartDragBehaviour = d3.drag().on('drag', (d, range) => {
            var i = this.ranges.indexOf(range)
            var rx = parseInt(scale.x.invert(d.x), 10)
            var ry = parseInt(scale.y.invert(d.y), 10)
            var src = this.updateValue(i, 'src', parseInt(rx, 10))
            var dst = this.updateValue(i, 'dst', parseInt(ry, 10))
            this.setRangeValue(i, src, dst)
        })

        circles.enter()
            .append('circle')
            .attr('class', 'point')
            .attr('fill', this.colors.circleFill)
            .attr('stroke', this.colors.circleStoke)
            .attr('stroke-width', 3)
            .attr('r', 20)
            .attr('cx', function (d) { return scale.x(d.src) })
            .attr('cy', function (d) { return scale.y(d.dst) })
            .call(chartDragBehaviour)

        circles.exit()
            .remove()

        var chartLine = d3.line()
            .x((d) => { return scale.x(d.src) })
            .y((d) => { return scale.y(d.dst) })

        g.select('.mapline')
            .datum(this.ranges)
            .attr('d', chartLine)
    },

    setRangeValue (idx, src, dst) {
        this.ranges[idx]['src'] = src
        this.ranges[idx]['dst'] = dst
    },

    updateSourceValue (val) {
        var g = this.svg.select('g')
        var scale = this._chartScales

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
            this.ws.onclose = undefined
            this.ws.close()
            this.ws = undefined
            this.onWebSocketClose()
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
        var match  = this.mapConfig.websocket.match

        var data = new Uint16Array(msg.data)
        var val = undefined
        for (var i = 0; i < data.length; i += packetSize) {
            if (match && (data[i + match.index] !== match.compare)) {
                continue;
            }
            val = data[i + packetIndex]
        }
        if (val !== undefined) {
            this.updateSourceValue(val)
        }
    },

    getStoreField (path) {
        return path
            .split(/[.[\]]+/)
            .reduce((prev, key) => prev[key], this.$store.state)
    }
}

export default {
    name: 'mapping',
    components: { MappingValues },
    watch,
    computed,
    methods,
    data,

    created () {
        this.setRangeValue = throttle(this.setRangeValue, 30)
        this.onResize = debounce(this.onResize, 100)
        this.setRanges = debounce(this.setRanges, 250)
    },

    mounted () {
        this.getMapping()
        this.setupChart()
        window.addEventListener('resize', this.onResize)
    },

    destroyed () {
        this.disconnectWebsocket()
        window.removeEventListener('resize', this.onResize)
    }
}
</script>

<style scoped>
svg {
    width: 100%;
    height: 400px;
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
</style>
