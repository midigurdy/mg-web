<template>
    <div>
        <router-view></router-view>
    </div>
</template>

<script>
import API from '@/api'

export default {
    name: 'config-area',
    data () {
        return {
            mappings: []
        }
    },
    created () {
        API.getMappings()
        .then(response => {
            this.mappings = response.data
        })
    }
}
</script>
