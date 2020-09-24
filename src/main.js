// Support for older browsers like Safari etc
// import 'babel-polyfill'

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import router from './router'
import store from './store'
import sockets from './store/websockets'

import vuetify from './plugins/vuetify';
// import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

/* eslint-disable no-unused-vars */
/* import Boostrap from 'bootstrap/dist/css/bootstrap.min.css'
import BoostrapTheme from 'bootstrap/dist/css/bootstrap-theme.min.css' */

Vue.config.productionTip = false
Vue.config.performance = false

/*
const observer = new window.PerformanceObserver(list => {
    list.getEntries().forEach((entry) => {
        if (entry.name.indexOf('render') !== -1) {
            console.count(entry.name)
        }
    })
})
observer.observe({entryTypes: ['measure']})
*/

import API from '@/api'

import Toolbar from '@/components/Toolbar'

Vue.component('mg-toolbar', Toolbar)

/* eslint-disable no-new */
new Vue({
    vuetify,
    router,
    store,
    components: { App },
    created () {
        this.$store.commit('generateClientId')
        this.$sockets = sockets
        this.$sockets.open(this.$store, API.getURL('MG_NOTIFY_WS_URL'))
    },
    beforeCreate () {
        this.$store.commit('uiLoadLocalStorage')
    },
    render: h => h(App)
}).$mount('#app')
