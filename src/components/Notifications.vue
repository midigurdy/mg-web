<template>
    <v-snackbar :timeout="timeout" v-model="visible" :color="color" top>
        {{ message }}
        <template v-slot:action>
            <v-btn text icon @click.native="visible = false"><v-icon>close</v-icon></v-btn>
        </template>
    </v-snackbar>
</template>

<script>
const watch = {
    visible () {
        if (!this.visible) {
            this.$store.dispatch('snacks/done')
            this.display()
        }
    }
}

const methods = {
    display () {
        var entry = this.$store.getters['snacks/get']
        if (!entry) {
            this.pending = false
            return
        }

        setTimeout(() => {
            this.message = entry.message
            this.color = entry.type || 'success'
            this.timeout = entry.timeout === undefined ? 3000 : entry.timeout
            this.visible = true
        }, 1)
    }
}

function data () {
    return {
        timeout: 3000,
        visible: false,
        color: '',
        message: '',
        pending: false
    }
}

export default {
    name: 'notifications',
    data,
    methods,
    watch,
    created () {
        this.display()
        this.$store.subscribe((mutation) => {
            if (mutation.type === 'snacks/push' && !this.pending && !this.visible) {
                this.pending = true
                this.display()
            }
        })
    }
}
</script>
