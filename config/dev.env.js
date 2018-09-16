var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    MG_API_URL: '"http://localhost:9090/api/"',
    MG_NOTIFY_WS_URL: '"ws://localhost:9001"',
    MG_DATA_WS_URL: '"ws://localhost:9000"'
})
