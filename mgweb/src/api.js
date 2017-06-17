import axios from 'axios'
import store from '@/store'

function getURL (name) {
    var url = process.env[name]
    url = url.replace('<ORIGIN>', location.protocol + '//' + location.host)
    url = url.replace('<HOSTNAME>', location.hostname)
    return url
}

export const API = axios.create({
    baseURL: getURL('MG_API_URL')
})

function formatErrors (errors) {
    return JSON.stringify(errors)
}

API.interceptors.response.use(
    null,
    (error) => {
        if (!error.config.silent) {
            var msg
            var errors
            try {
                msg = error.response.data.message
            } catch (e) {}
            try {
                errors = error.response.data.errors
            } catch (e) {}
            if (msg) {
                store.dispatch('snacks/add', {
                    message: 'API Error: ' + msg,
                    type: 'error',
                    timeout: 2000
                })
            } else if (errors) {
                store.dispatch('snacks/add', {
                    message: formatErrors(errors),
                    type: 'error',
                    timeout: 6000
                })
            } else {
                store.dispatch('snacks/add', {
                    message: 'API request failed',
                    type: 'error',
                    timeout: 1000
                })
            }
        }
        return Promise.reject(error)
    }
)

function emptyPreset () {
    return {
        id: null,
        name: '',
        voices: {
            melody: [emptyVoice(), emptyVoice(), emptyVoice()],
            drone: [emptyVoice(), emptyVoice(), emptyVoice()],
            trompette: [emptyVoice(), emptyVoice(), emptyVoice()]
        },
        main: {
            volume: 127,
            gain: 1.0,
            pitchbend_range: 100
        },
        chien: {
            threshold: 50
        },
        tuning: {
            coarse: 0,
            fine: 0
        },
        reverb: {
            volume: 30,
            panning: 64
        },
        keynoise: {
            soundfont: null,
            bank: 0,
            program: 0,
            volume: 20,
            panning: 64
        }
    }
}

function emptyVoice () {
    return {
        soundfont: null,
        bank: 0,
        program: 0,
        volume: 127,
        panning: 64,
        muted: false,
        note: 60,
        capo: 0,
        polyphonic: false,
        mode: 'midigurdy',
        finetune: 0
    }
}

export default {
    getURL,

    setClientId (id) {
        API.defaults.headers.common['mg-client-id'] = id
    },

    getMapping (name) {
        return API.get('mappings/' + name)
    },

    resetMapping (name) {
        return API.delete('mappings/' + name)
    },

    getMappings () {
        return API.get('mappings')
    },

    updateRanges (name, ranges) {
        return API.put('mappings/' + name, { ranges })
    },

    getPresets () {
        return API.get('presets', {
            transformResponse: [].concat(
                axios.defaults.transformResponse,
                (data) => {
                    return data.map((p) => {
                        return Object.assign(emptyPreset(), p)
                    })
                }
            )
        })
    },

    getPreset (id) {
        return API.get('presets/' + id, {
            transformResponse: [].concat(
                axios.defaults.transformResponse,
                (data) => Object.assign(emptyPreset(), data)
            )
        })
    },

    getInstrumentState () {
        return API.get('instrument', {
            transformResponse: [].concat(
                axios.defaults.transformResponse,
                (data) => Object.assign(emptyPreset(), data)
            )
        })
    },

    updateInstrumentState (data) {
        return API.put('instrument', data, {
            transformResponse: [].concat(
                axios.defaults.transformResponse,
                (data) => {
                    return Object.assign(emptyPreset(), data)
                }
            )
        })
    },

    savePreset (preset) {
        if (preset.id) {
            return API.put('presets/' + preset.id, preset)
        } else {
            return API.post('presets', preset)
        }
    },

    loadPreset (id) {
        return API.post('presets/' + id + '/load')
    },

    deletePreset (id) {
        return API.delete('presets/' + id)
    },

    reorderPresets (orderedIds) {
        return API.post('presets/order', {
            order: orderedIds
        })
    },

    getSounds () {
        return API.get('sounds')
    },

    getSound (id) {
        return API.get('sounds/' + id)
    },

    uploadSound (binary, filename, overwrite, progressCallback) {
        var url = ['upload/sound', filename]
        if (overwrite) {
            url.push('1')
        }
        return API.post(url.join('/'), binary, {
            onUploadProgress: progressCallback,
            headers: {'Content-Type': 'application/octet-stream'}
        })
    },

    importConfig (data, presets, mappings, calibration, settings) {
        return API.post('/config', data, {
            headers: {'Content-Type': 'application/json'},
            params: { presets, mappings, calibration, settings }
        })
    },

    deleteSound (id) {
        return API.delete('sounds/' + id)
    },

    getSystemInformation () {
        return API.get('info', {silent: true})
    },

    getKeyCalibration () {
        return API.get('calibrate/keyboard')
    },

    saveKeyCalibration (data) {
        return API.put('calibrate/keyboard', data)
    },

    resetKeyCalibration () {
        return API.delete('calibrate/keyboard')
    },

    getMiscConfig () {
        return API.get('misc')
    },

    saveMiscConfig (misc) {
        return API.put('misc', misc)
    },

    emptyPreset
}
