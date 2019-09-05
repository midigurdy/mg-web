import Vue from 'vue'
import Vuex from 'vuex'

import API from '@/api.js'
import snacks from '@/store/snacks'

Vue.use(Vuex)

function clone (obj) {
    return JSON.parse(JSON.stringify(obj))
}

function presetById (state, id) {
    return state.presets.find((el) => el.id === id)
}

function generateUUID () {
    var d = new Date().getTime()
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now() // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
}

const debug = process.env.NODE_ENV !== 'production'

const state = {
    ui: {
        navbar: true,
        visControls: false,
        notifications: [],
        darkTheme: false
    },
    presets: [],
    soundfonts: [],
    connected: false,
    systemInformation: {},
    sounds: [],
    instrument: {},
    misc: {}
}

const getters = {
    multiChienThreshold (state) {
        return (state.misc.ui || {}).multi_chien_threshold
    },

    getPresets (state) {
        return state.presets
    },

    getNotifications (state) {
        return state.ui.notifications
    },

    getPreset: (state) => (id) => {
        var preset = presetById(state, id)
        if (!preset) {
            throw new Error('Preset ' + id + ' not found!')
        }
        return clone(preset)
    },

    getInstrumentState (state) {
        return clone(state.instrument)
    },

    sortedSoundFonts (state) {
        return state.soundfonts.concat().sort((a, b) => {
            if (a.mode !== b.mode) {
                return a.mode < b.mode
            }
            if (a.name !== b.name) {
                return a.name > b.name
            }
            return a.id > b.id
        })
    },

    soundFontTree (state) {
        var tree = getters.sortedSoundFonts(state).map(function (sf) {
            return {
                id: sf.id,
                label: sf.name,
                children: sf.sounds.map(function (snd) {
                    return {
                        id: snd.id,
                        label: snd.name + ' (' + sf.name + ')',
                        list_label: snd.name
                    }
                })
            }
        })
        return tree
    },

    typedSoundFontTree: (state) => (type) => {
        var typedFonts = getters.sortedSoundFonts(state).filter((sf) => {
            if (sf.mode !== 'midigurdy') return false
            return !!sf.sounds.find((snd) => {
                return snd.type === type
            })
        })
        return typedFonts.map(function (sf) {
            return {
                id: sf.id,
                label: sf.name,
                children: sf.sounds.filter((snd) => snd.type === type).map(function (snd) {
                    return {
                        id: snd.id,
                        label: snd.name + ' (' + sf.name + ')',
                        list_label: snd.name
                    }
                })
            }
        })
    },

    getSoundAndFont: (state) => (id) => {
        const sfid = id.split(':')[0]
        var soundfont = state.soundfonts.find((sf) => { return sf.id === sfid })
        if (!soundfont) return
        var sound = soundfont.sounds.find((s) => { return s.id === id })
        if (!sound) return
        return {sound, soundfont}
    }
}

const mutations = {
    uiUpdateVisControls (state, value) {
        state.ui.visControls = value
    },

    uiUpdateNavbar (state, value) {
        state.ui.navbar = value
    },

    uiUpdateDarkTheme (state, value) {
        state.ui.darkTheme = value
        localStorage.setItem('mgweb_dark', value ? 'dark' : 'light')
    },

    uiLoadDarkTheme (state, value) {
        var dark = (localStorage.getItem('mgweb_dark') === 'dark')
        state.ui.darkTheme = dark
    },

    setPresets (state, presets) {
        state.presets = presets
    },

    setChienThreshold (state, data) {
        var st
        if (data.string === 'trompette1') {
            st = state.instrument.voices.trompette[0]
        } else if (data.string === 'trompette2') {
            st = state.instrument.voices.trompette[1]
        } else if (data.string === 'trompette3') {
            st = state.instrument.voices.trompette[2]
        } else {
            return
        }
        st.chien_threshold = data.chien_threshold
    },

    setMainVolume (state, val) {
        state.instrument.main.volume = val
    },

    setPitchbendRange (state, val) {
        state.instrument.main.pitchbend_range = val
    },

    setReverbVolume (state, val) {
        state.instrument.reverb.volume = val
    },

    generateClientId (state) {
        state.clientId = generateUUID()
        API.setClientId(state.clientId)
    },

    setPresetName (state, { presetId, name }) {
        var preset = state.presets.find(p => p.id === presetId)
        if (preset) {
            preset.name = name
        }
    },

    setPreset (state, preset) {
        for (var i = 0; i < state.presets.length; i++) {
            if (state.presets[i].id === preset.id) {
                break
            }
        }
        state.presets.splice(i, 1, preset)
    },

    setInstrumentState (state, instrument) {
        state.instrument = instrument
    },

    setMiscConfig (state, misc) {
        state.misc = misc
    },

    setPresetOrder (state, orderedIds) {
        var presets = []
        orderedIds.forEach((id) => {
            presets.push(presetById(state, id))
        })
        state.presets = presets
    },

    removePreset (state, id) {
        state.presets = state.presets.filter((preset) => { return preset.id !== id })
    },

    setSoundFonts (state, soundfonts) {
        state.soundfonts = soundfonts
    },

    setSoundFont (state, soundfont) {
        const sf = state.soundfonts.find((sf) => { return sf.id === soundfont.id })
        if (sf) {
            Object.assign(sf, soundfont)
        } else {
            state.soundfonts.push(soundfont)
        }
    },

    removeSoundFont (state, id) {
        state.soundfonts = state.soundfonts.filter((sf) => { return sf.id !== id })
    },

    setConnectedState (state, connected) {
        state.connected = connected
    },

    setSystemInformation (state, info) {
        state.systemInformation = info
    }
}

const actions = {
    notificationsPop ({ commit, state }) {
        return state.ui.notifications.shift()
    },

    /* PRESETS */
    fetchPresets ({ commit }) {
        API.getPresets()
        .then((response) => {
            commit('setPresets', response.data)
        })
    },

    fetchPreset ({ commit }, id) {
        return API.getPreset(id).then((response) => {
            commit('setPreset', response.data)
        })
    },

    fetchInstrumentState ({ commit }) {
        return API.getInstrumentState().then((response) => {
            commit('setInstrumentState', response.data)
        })
    },

    fetchMiscConfig ({ commit }) {
        return API.getMiscConfig().then((response) => {
            commit('setMiscConfig', response.data)
        })
    },

    updateInstrumentState ({ commit }, data) {
        return API.updateInstrumentState(data)
    },

    loadPreset ({ commit, getters }, id) {
        return API.loadPreset(id).then(() => {
            commit('setInstrumentState', getters.getPreset(id))
        })
    },

    removePreset ({ commit }, id) {
        API.deletePreset(id)
        .then(() => {
            commit('removePreset', id)
        })
    },

    replacePreset ({ commit, getters }, id) {
        var preset = getters.getPreset(id)
        var instrument = getters.getInstrumentState
        delete instrument.id
        delete instrument.number
        delete instrument.name
        Object.assign(preset, instrument)
        return API.savePreset(preset)
        .then((response) => {
            commit('setPreset', response.data)
        })
    },

    saveNewPreset ({ commit, getters }, name) {
        var preset = getters.getInstrumentState
        Object.assign(preset, {id: null, number: null, name: name})
        return API.savePreset(preset)
        .then((response) => {
            commit('setPreset', response.data)
        })
    },

    reorderPresets ({ commit }, presets) {
        var orderedIds = presets.map((p) => { return p.id })
        API.reorderPresets(orderedIds)
        .then((response) => {
            commit('setPresetOrder', response.data.order)
        })
    },

    savePreset ({ commit }, preset) {
        return API.savePreset(preset)
        .then((response) => {
            commit('setPreset', response.data)
            return response
        })
    },

    /* SOUNDS */
    fetchSoundFonts ({ commit }) {
        API.getSounds()
        .then((response) => {
            commit('setSoundFonts', response.data)
        })
    },

    fetchSoundFont ({ commit }, id) {
        API.getSound(id)
        .then((response) => {
            commit('setSoundFont', response.data)
        })
    },

    removeSoundFont ({ commit }, id) {
        return API.deleteSound(id).then(() => {
            commit('removeSoundFont', id)
        })
    },

    uploadSoundFont ({ commit }, { binary, filename, overwrite, progressCallback }) {
        return API.uploadSound(binary, filename, overwrite, progressCallback)
        .catch(() => {
            // just ignore, as message is already displayed by
            // global API error handler
        })
        .then((response) => {
            commit('setSoundFont', response.data)
        })
    }
}

export default new Vuex.Store({
    modules: {
        snacks
    },
    strict: debug,

    state,
    getters,
    mutations,
    actions
})
