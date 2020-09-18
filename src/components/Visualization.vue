<template>
    <div>
        <mg-toolbar title="Wheel Visualisation">
            <v-spacer/>
            <v-toolbar-items>
                <v-btn @click.stop="toggleControls" text><v-icon>settings</v-icon> Settings</v-btn>
            </v-toolbar-items>
        </mg-toolbar>

        <v-navigation-drawer right app touchless v-model="controls">
            <div class="text-xs-center" v-if="!wsConnected">
                <v-chip color="red" text-color="white">
                    {{ wsStatusLabel }}
                </v-chip>
            </div>

            <v-divider/>

            <v-card flat>
                <v-card-text>
                    <v-btn block color="primary" @click.stop="setRotationOffset">Set top position</v-btn>
                    <p>Or press <em>Spacebar</em> to set top position.</p>
                </v-card-text>
            </v-card>

            <v-divider/>

            <v-card flat>
                <v-card-text>
                    <label>Fade Speed: {{ fadeSpeed }}
                        <v-slider thumb-label v-model.number="fadeSpeed" min="0" max="8"/>
                    </label>

                    <v-btn block color="secondary" @click.stop="clearScreen">Clear screen</v-btn>
                    <div>Or press <em>c</em> to clear the screen</div>
                </v-card-text>
            </v-card>

            <v-divider/>

            <v-card flat>
                <v-card-text>
                    <v-switch v-model="showSpeedLine" label="Show Wheel Speed"/>
                    <div v-if="showSpeedLine">
                        <label>Line Max Radius: {{ lineMaxRadius }}
                            <v-slider thumb-label v-model.number="lineMaxRadius" min="320" max="500"/>
                        </label>
                        <label>Line Max Speed: {{ lineMaxSpeed }}
                            <v-slider thumb-label v-model.number="lineMaxSpeed" min="1" max="11000"/>
                        </label>
                    </div>
                </v-card-text>
            </v-card>

            <v-divider/>

            <v-card flat>
                <v-card-text>
                    <label>Mark Coups: {{ numCoups > 0 ? numCoups : 'disabled' }}
                        <v-slider thumb-label v-model.number="numCoups" min="1" max="16"/>
                    </label>
                </v-card-text>
            </v-card>
        </v-navigation-drawer>

    <v-container fluid class="vis-outer" fill-height>
        <v-layout row wrap>
            <v-flex xs12 id="vis-container" ref="vis">
            </v-flex>
        </v-layout>
    </v-container>
</div>
</template>

<script>
import * as PIXI from 'pixi.js'
import API from '@/api.js'

const STAGE_WIDTH = 1000
const STAGE_HEIGHT = 1000
const HALF_PI = Math.PI / 2.0

function pushMaxSize (ary, el, maxSize) {
    if (maxSize === 0) return
    while (ary.length >= maxSize) {
        ary.shift()
    }
    ary.push(el)
}

function color (r, g, b) {
    return PIXI.utils.rgb2hex([
        r > 1 ? 1 : r,
        g > 1 ? 1 : g,
        b > 1 ? 1 : b
    ])
}

function data () {
    return {
        speed: 100,
        stopVisualization: false,

        fps: 0,

        arcInnerRadius: 200,
        arcOuterRadius: 300,

        showSpeedLine: false,
        lineMaxRadius: 500,
        lineMinRadius: 310,
        lineMaxSpeed: 5000,

        bgColor: 0,
        fadeSpeed: 2,

        pointerWidth: 3,
        pointerColor: color(1, 1, 1),

        chienThreshold: 2500,

        wsConnected: false,
        wsStatusLabel: 'Not connected!',

        onePosition: '12',
        topOffset: HALF_PI,

        coupPositions: [],
        numCoups: 0,
        coupDetectThreshold: 80,
        coupDetectHysteresis: 30,
        coupDebounce: 0,
        coupDebounceCount: 5,
        coupOn: false,

        doClear: false,
    }
}

const computed = {
    controls: {
        get () {
            return this.$store.state.ui.visControls
        },
        set (value) {
            this.$store.commit('uiUpdateVisControls', value)
        }
    },

    rotationOffset: {
        get () {
            return this.$store.state.ui.visCrankPosition
        },
        set (value) {
            this.$store.commit('uiUpdateCrankPosition', value)
        },
    },
}

const watch = {
    fadeSpeed () {
        this.updateOverlay()
    },

    onePosition () {
        if (this.onePosition === '12') {
            this.topOffset = HALF_PI
            this.pointer.rotation -= HALF_PI
        } else {
            this.topOffset = 0
            this.pointer.rotation += HALF_PI
        }
        this.lastLineX = this.lastLineY = undefined
    },

    numCoups () {
        this.coupPositions = []
    }
}

const methods = {
    clearScreen () {
        this.doClear = true
    },

    toggleControls () {
        this.$store.commit('uiUpdateVisControls', !this.$store.state.ui.visControls)
    },

    pos2angle (pos) {
        return (pos / 16384.0) * Math.PI * 2 - this.topOffset
    },

    clearCoups () {
        this.coupDebounce = 0
        this.coupPositions = []
    },

    detectCoups (data) {
        var onThreshold = this.coupDetectThreshold
        var offThreshold = this.coupDetectThreshold - this.coupDetectHysteresis

        for (var i = 0, ilen = data.length; i < ilen; i++) {
            var chien = data[i][3]
            var pos = data[i][2]
            if (!this.coupOn) {
                if (chien > onThreshold) {
                    this.coupDebounce++
                    if (this.coupDebounce > this.coupDebounceCount) {
                        this.coupDebounce = 0
                        this.coupOn = true
                        pushMaxSize(this.coupPositions, pos, this.numCoups)
                    }
                } else {
                    this.coupDebounce = 0
                }
            } else {
                if (chien < offThreshold) {
                    this.coupDebounce++
                    if (this.coupDebounce > this.coupDebounceCount) {
                        this.coupOn = false
                        this.coupDebounce = 0
                    }
                } else {
                    this.coupDebounce = 0
                }
            }
        }
    },

    resizeCanvas () {
        var containerHeight = window.innerHeight - this.$refs.vis.offsetTop
        var containerWidth = this.$refs.vis.offsetWidth

        /* remove padding from container size */
        var innerHeight = containerHeight - 40
        var innerWidth = containerWidth - (2 * 15)

        /* Aspect ratio of canvas should always be 1:1 */
        var size = innerHeight < innerWidth ? innerHeight : innerWidth

        this.vis.renderer.view.style.width = size + 'px'
        this.vis.renderer.view.style.height = size + 'px'
    },

    createQueue () {
        this.queue = []
    },

    setRotationOffset () {
        this.rotationOffset = this.pointer.rotation + this.rotationOffset + this.topOffset
        this.updateFromRotationOffset(this.rotationOffset)
    },

    updateFromRotationOffset (offset) {
        this.line.rotation = -offset
        this.arc.rotation = -offset
        this.coups.rotation = -offset
    },

    onKeyDown (evt) {
        if (evt.code === 'Space') {
            this.setRotationOffset()
        } else if (evt.code === 'KeyC') {
            this.clearScreen()
        }
    },

    connectWebsocket () {
        this.wsStatusLabel = 'Connecting...'
        this.ws = new WebSocket(API.getURL('MG_DATA_WS_URL'), 'wheel')
        this.ws.onmessage = this.onWebSocketData
        this.ws.onclose = this.onWebSocketClose
        this.ws.onopen = this.onWebSocketOpen
        this.ws.binaryType = 'arraybuffer'
    },

    onWebSocketOpen () {
        this.wsStatusLabel = 'Connected'
        this.wsConnected = true
    },

    onWebSocketClose () {
        this.wsConnected = false
        this.wsStatusLabel = 'Not connected!'
        if (this.retryWebSocket) {
            setTimeout(this.connectWebsocket, 1000)
        }
    },

    onWebSocketData (msg) {
        var data = new Uint16Array(msg.data)
        for (var i = 0; i < data.length; i += 4) {
            var pos = data[i]
            var speed = data[i + 1]
            var chien = data[i + 2]
            var angle = this.pos2angle(pos)
            if (this.prevAngle === undefined) {
                this.prevAngle = angle
            }
            this.queue.push([speed, this.prevAngle, angle, chien])
            this.prevAngle = angle
        }
    },

    createVisualization () {
        var vis = this.vis = new PIXI.Application({
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            forceCanvas: false,
            antialias: true
        })

        /* Patch WebGLState with support for DIFFERENCE blend mode. Maybe not
           needed anymore when upgrading to Pixi v5 */
        if (vis.renderer.type === PIXI.RENDERER_TYPE.WEBGL) {
            var state = vis.renderer.state
            var gl = state.gl

            state.blendModes[PIXI.BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE]
            state.origSetBlendMode = state.setBlendMode

            state.setBlendMode = function (value) {
                if (value === PIXI.BLEND_MODES.DIFFERENCE) {
                    gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT)
                } else {
                    gl.blendEquation(gl.FUNC_ADD)
                }
                this.origSetBlendMode(value)
            }.bind(state)
        }

        // add to DOM and resize canvas element to fill container
        this.$refs.vis.appendChild(vis.renderer.view)
        this.resizeCanvas()
    },

    destroyVisualization () {
        this.vis.stop()
        this.vis.renderer.state.blendMode = undefined
        this.vis.destroy(true)
        this.vis = undefined
    },

    startAnimation () {
        var renderer = this.vis.renderer
        var stage = this.vis.stage

        /* Center point of viewport */
        var cx = renderer.view.width / 2
        var cy = renderer.view.height / 2

        /* Setup fading stage */
        var fadingTexture = PIXI.RenderTexture.create(renderer.width, renderer.height)
        var fadingTexture2 = PIXI.RenderTexture.create(renderer.width, renderer.height)
        var fadingSprite = new PIXI.Sprite(fadingTexture)
        var fadingStage = new PIXI.Container()
        fadingStage.addChild(fadingSprite)
        stage.addChild(fadingStage)

        /* Arc section that gets drawn from previous pointer position to current pointer position */
        this.arc = this.createArc(cx, cy)
        fadingStage.addChild(this.arc)

        /* Speed line on faded stage */
        this.line = this.createSpeedLine(cx, cy)
        fadingStage.addChild(this.line)

        /* Add full-screen overlay that subtracts fadeValue from the rendered image */
        this.overlay = this.createOverlay()
        this.updateOverlay()
        fadingStage.addChild(this.overlay)

        /* Rotating pointer on main stage - not faded */
        var pointer = this.pointer = this.createPointer(cx, cy)
        stage.addChild(pointer)

        /* Coup markers on main stage - not faded */
        var coups = this.coups = this.createCoups(cx, cy)
        stage.addChild(coups)

        var skipFade = false

        var animate = function () {
            if (this.stopVisualization) {
                this.destroyVisualization()
                return
            }

            if (this.doClear) {
                this.overlay.clear()
                    .beginFill(color(1, 1, 1), 1)
                    .drawRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)
                    .endFill()
            } else if (skipFade) {
                fadingStage.removeChild(this.overlay)
            }

            this.arc.clear()
            this.line.clear()

            if (this.showSpeedLine) {
                this.updateSpeedLine(this.queue)
            } else if (this.lastLineX) {
                this.lastLineX = this.lastLineY = undefined
            }

            if (this.doClear) {
                this.clearCoups()
                this.updateCoups()
            } else if (this.queue) {
                this.detectCoups(this.queue)
                this.updateCoups()
            }

            var data
            while (this.queue.length) {
                data = this.queue.shift()
                this.updateArc(data[3], data[1], data[2])
            }

            if (data) {
                pointer.rotation = (data[2] - this.rotationOffset)
            }

            // swap the buffers to avoid WebGL "target same as source" warning
            var temp = fadingTexture
            fadingTexture = fadingTexture2
            fadingTexture2 = temp
            fadingSprite.texture = fadingTexture
            renderer.render(fadingStage, fadingTexture2)

            if (skipFade) {
                fadingStage.addChild(this.overlay)
                skipFade = false
            } else {
                skipFade = true
            }

            /* main stage is rendered by PIXI application ticker */
            if (this.doClear) {
                this.updateOverlay()
                this.doClear = false
            }
        }

        var fpsCalls = 0
        function showFPS () {
            var ticker = this.vis.ticker
            fpsCalls++
            if (fpsCalls > 60) {
                this.fps = Math.round(ticker.FPS, 2)
                fpsCalls = 0
            }
        }

        var testCalls = 0
        this.vis.ticker.add(animate, this)
        this.vis.ticker.add(showFPS, this, PIXI.UPDATE_PRIORITY.UTILITY)
        this.vis.ticker.add(function () {
            testCalls++
            if (testCalls > 3) {
                testCalls = 0
                // this.generateTestData()
            }
        }, this, PIXI.UPDATE_PRIORITY.UTILITY)
    },

    createCoups (cx, cy) {
        const coups = new PIXI.Graphics()
        coups.x = cx
        coups.y = cy
        return coups
    },

    updateCoups () {
        this.coups.clear()
        this.coups.lineStyle(2, 0xffffff, 1)
        for (var i = 0, ilen = this.coupPositions.length; i < ilen; i++) {
            var angle = this.coupPositions[i]
            var ax = Math.cos(angle)
            var ay = Math.sin(angle)
            var x0 = ax * 400
            var y0 = ay * 400
            var x1 = ax * 450
            var y1 = ay * 450
            this.coups.moveTo(x0, y0)
                .lineTo(x1, y1)
        }
    },

    createArc (cx, cy) {
        const arc = new PIXI.Graphics()
        arc.x = cx
        arc.y = cy
        return arc
    },

    updateArc (chien, fromAngle, toAngle) {
        var arcColor = this.calcChienColorFromSpeed(chien)

        if (arcColor === 0) {
            return
        }
        var arc = this.arc

        var antiClockwise = toAngle < fromAngle

        var diff = toAngle - fromAngle
        if (diff < -Math.PI || diff > Math.PI) {
            antiClockwise = !antiClockwise
        }

        // outer pie
        arc.beginFill(arcColor, 0.4)
            .moveTo(0, 0)
            .arc(0, 0, this.arcOuterRadius, fromAngle, toAngle, antiClockwise)
            .lineTo(0, 0)
            .endFill()

        // inner pie
        arc.beginFill(this.bgColor, 1)
            .moveTo(0, 0)
        /* draw inner arc slightly wider to avoid stray pixels due to
               rounding issues */
            .arc(0, 0, this.arcInnerRadius, 0, Math.PI * 2)
            .lineTo(0, 0)
            .endFill()
    },

    createOverlay () {
        var overlay = new PIXI.Graphics()
        overlay.blendMode = PIXI.BLEND_MODES.DIFFERENCE
        return overlay
    },

    updateOverlay () {
        var fadeValue = this.fadeSpeed / 255.0
        this.overlay.clear()
            .beginFill(color(fadeValue, fadeValue, fadeValue), 1)
            .drawRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)
            .endFill()
    },

    createPointer (cx, cy) {
        const pointerLength = this.arcOuterRadius + 50
        var pointer = new PIXI.Graphics()
        // inner circle
            .beginFill(this.pointerColor, 1)
            .arc(0, 0, 10, 0, 2 * Math.PI)
            .endFill()

            // pointer line
            .moveTo(0, 0)
            .lineStyle(this.pointerWidth, this.pointerColor, 1)
            .lineTo(pointerLength, 0)

        pointer.x = cx
        pointer.y = cy
        pointer.pivot.set(0, 0)

        return pointer
    },

    createSpeedLine (cx, cy) {
        var line = new PIXI.Graphics()
        line.x = cx
        line.y = cy
        return line
    },

    updateSpeedLine (data) {
        var x = this.lastLineX
        var y = this.lastLineY
        var h
        var speed
        const lineMaxHeight = this.lineMaxRadius - this.lineMinRadius
        const line = this.line
        const maxSpeed = this.lineMaxSpeed * 1.0

        line.lineStyle(2, color(0.2, 0.4, 0.6), 1)

        if (x === undefined && data.length) {
            speed = data[0][0]
            h = Math.min(1.0, speed / maxSpeed) * lineMaxHeight + this.lineMinRadius
            x = Math.cos(data[0][2]) * h
            y = Math.sin(data[0][2]) * h
        }
        line.moveTo(x, y)

        for (var i = 0, ilen = data.length; i < ilen; i++) {
            speed = data[i][0]
            h = Math.min(1.0, speed / maxSpeed) * lineMaxHeight + this.lineMinRadius
            x = Math.cos(data[i][2]) * h
            y = Math.sin(data[i][2]) * h

            line.lineTo(x, y)
        }

        this.lastLineX = x
        this.lastLineY = y
    },

    calcChienColorFromSpeed (chien) {
        if (chien <= 0) {
            return 0
        }
        var f = chien / 127.0
        return color(2.0 * f, 0.5 * f, 0.5 * f)
    },

    generateTestData () {
        this.testData = this.testData || 0
        this.testSpeed = this.testSpeed || 0

        const num = Math.round(Math.random(123) * 7)
        const smooth = 0.8
        for (var i = 0; i < num; i++) {
            var speed = Math.round(Math.random(456) * this.lineMaxSpeed * (this.speed / 100))
            this.testSpeed = this.testSpeed * smooth + speed * (1 - smooth)
            this.queue.push([this.testSpeed, this.pos2angle(this.testData), this.pos2angle(this.testData + speed)])
            this.testData += speed
        }
    }
}

export default {
    name: 'visualization',
    data,
    methods,
    computed,
    watch,
    mounted () {
        document.body.className = 'vis-body'
        this.createQueue()
        this.createVisualization()
        this.startAnimation()
        window.addEventListener('resize', this.resizeCanvas)
        window.addEventListener('keydown', this.onKeyDown)
        this.retryWebSocket = true
        this.connectWebsocket()
        if (this.rotationOffset) {
            this.updateFromRotationOffset(this.rotationOffset)
        }
    },
    beforeDestroy () {
        document.body.className = ''
        window.removeEventListener('resize', this.resizeCanvas)
        window.removeEventListener('keydown', this.onKeyDown)
        this.retryWebSocket = false
        this.ws.close()
        this.ws = undefined
        this.stopVisualization = true
    }
}
</script>

<style>
#vis-container {
    text-align: center;
}
</style>
