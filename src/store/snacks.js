const state = {
    snacks: []
}

const getters = {
    get (state) {
        if (state.snacks.length) {
            return state.snacks[0]
        }
    }
}

const actions = {
    add ({ commit }, entry) {
        commit('push', entry)
    },

    done ({ commit }) {
        commit('shift')
    }
}

const mutations = {
    push (state, snack) {
        state.snacks.push(snack)
    },

    shift (state) {
        state.snacks.shift()
    }
}

export default {
    namespaced: true,

    state,
    getters,
    mutations,
    actions
}
