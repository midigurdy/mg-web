var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    //MG_API_URL: '"http://midigurdy.local/api/"',
    //MG_NOTIFY_WS_URL: '"ws://midigurdy.local:9001"',
    //MG_DATA_WS_URL: '"ws://midigurdy.local:9000"'
    MG_API_URL: '"http://192.168.178.133:9090/api/"',
    MG_NOTIFY_WS_URL: '"ws://192.168.178.133:9001"',
    MG_DATA_WS_URL: '"ws://192.168.178.133:9000"'
})
