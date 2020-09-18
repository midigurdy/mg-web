<template>
<div>
    <mg-toolbar :title="!preset.id ? 'New Preset' : preset.name || 'Unnamed'">
        <v-btn slot="icon" icon :to="{name: 'preset-list'}" exact>
            <v-icon>arrow_back</v-icon>
        </v-btn>

        <v-spacer/>
        <v-toolbar-items>
            <v-btn v-if="preset.id" text :icon="$vuetify.breakpoint.xs" :href="'/api/presets/'+preset.id+'?dl=1'">
               <v-icon left>cloud_download</v-icon><span class="hidden-xs-only">Export</span>
            </v-btn>
            <v-btn v-if="preset.id" text :icon="$vuetify.breakpoint.xs" @click="deletePreset">
               <v-icon left>delete</v-icon><span class="hidden-xs-only">Delete</span>
            </v-btn>
            <v-btn text :icon="$vuetify.breakpoint.xs" @click="savePreset">
                <v-icon>done</v-icon> <span class="hidden-xs-only">Save</span>
            </v-btn>
        </v-toolbar-items>
    </mg-toolbar>

    <state-edit :state.sync="preset" showName="true"/>
</div>
</template>

<script>
import StateEdit from '@/components/state/StateEdit'
import API from '@/api'

function data () {
    return {
        preset: API.emptyPreset(),
        errors: {}
    }
}

const methods = {
    deletePreset () {
        if (confirm('Are you sure you want to delete this Preset?')) {
            this.$store.dispatch('removePreset', this.preset.id).then(() => {
                this.$store.dispatch('snacks/add', {message: 'Preset deleted'})
                this.$router.push({name: 'preset-list'})
            })
        }
    },

    savePreset () {
        this.errors = {}
        this.$store.dispatch('savePreset', this.preset)
            .then((response) => {
                this.$store.dispatch('snacks/add', {message: 'Preset saved successfully'})
                this.$router.push({name: 'preset-edit', params: {presetId: response.data.id}})
            })
            .catch(({ response }) => {
                if (response.data.errors) {
                    this.errors = Object.assign({}, this.errors, response.data.errors)
                    this.$store.dispatch('snacks/add', {
                        message: 'Unable to save preset',
                        type: 'warning'
                    })
                }
            })
    },

    loadPreset () {
        var id = parseInt(this.$route.params.presetId, 10)
        if (!id) {
            this.preset = API.emptyPreset()
        } else {
            this.$store.dispatch('fetchPreset', id)
            .then(() => {
                this.preset = this.$store.getters.getPreset(id)
            })
            .catch(() => {
                this.$store.dispatch('snacks/add', {
                    message: 'Preset not found!',
                    type: 'error'
                })
                this.$router.push({name: 'preset-list'})
            })
        }
    }
}

const watch = {
    '$route' () {
        this.loadPreset()
    }
}

export default {
    name: 'preset-edit',
    data,
    methods,
    watch,
    components: {
        StateEdit
    },

    activated () {
        this.loadPreset()
    },

    deactivated () {
        this.errors = {}
    }
}
</script>
