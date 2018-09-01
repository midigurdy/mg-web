import { debounce } from 'lodash'

const events = {
    'sysinfo': ({ store, msg }) => {
        store.commit('setSystemInformation', msg.data)
    },

    'main_volume:changed': ({ store, msg }) => {
        store.commit('setMainVolume', msg.data.main_volume)
    },

    'chien_threshold:changed': ({ store, msg }) => {
        store.commit('setChienThreshold', msg.data.chien_threshold)
    },

    'reverb_volume:changed': ({ store, msg }) => {
        store.commit('setReverbVolume', msg.data.reverb_volume)
    },

    'pitchbend_range:changed': ({ store, msg }) => {
        store.commit('setPitchbendRange', msg.data.pitchbend_range)
    },

    'preset:added': ({ store, msg }) => {
        store.dispatch('fetchPreset', msg.data.id)
    },

    'preset:deleted': ({ store, msg }) => {
        store.commit('removePreset', msg.data.id)
    },

    'preset:changed': ({ store, msg }) => {
        store.dispatch('fetchPreset', msg.data.id)
    },

    'preset:reordered': ({ store, msg }) => {
        store.commit('setPresetOrder', msg.data.order)
    },

    'sound:added': ({ store, msg }) => {
        store.dispatch('fetchSoundFont', msg.data.id)
    },

    'sound:changed': ({ store, msg }) => {
        store.dispatch('fetchSoundFont', msg.data.id)
    },

    'sound:deleted': ({ store, msg }) => {
        store.commit('removeSoundFont', msg.data.id)
    }
}

const loadInstrumentState = debounce(function (store) {
    store.dispatch('fetchInstrumentState')
}, 250)

const socket = {
    open (store, url) {
        this.store = store
        this.url = url
        this.connect()
    },

    connect () {
        socket.ws = new WebSocket(socket.url)
        socket.ws.onclose = socket.onClose
        socket.ws.onopen = socket.onOpen
        socket.ws.onmessage = socket.onMessage
    },

    onClose () {
        socket.store.commit('setConnectedState', false)
        setTimeout(socket.connect, 1000)
    },

    onOpen: () => {
        socket.store.commit('setConnectedState', true)
        socket.ws.send(JSON.stringify({
            name: 'client_id',
            data: {id: socket.store.state.clientId}
        }))
        socket.store.dispatch('fetchSoundFonts')
        socket.store.dispatch('fetchPresets')
        socket.store.dispatch('fetchInstrumentState')
    },

    onMessage (evt) {
        const msg = JSON.parse(evt.data)
        const handler = socket.events[msg.name]
        if (handler) {
            handler({ store: socket.store, msg })
        } else if (msg.name.endsWith(':changed')) {
            loadInstrumentState(socket.store)
        } else {
            console.log('unknown msg', msg)
        }
    },

    events
}

export default socket
