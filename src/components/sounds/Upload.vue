<template>
    <v-dialog v-model="visible" max-width="50%">
        <v-card>
            <v-card-title class="headline">Add Soundfont</v-card-title>
            <v-card-text>
                <form enctype="multipart/form-data" novalidate>
                    <div class="dropbox">
                        <input id="fileupload" ref="fileupload" type="file"
                            name="sound" :disabled="status == 'uploading'"
                            @change.stop="filesChange($event.target.files); fileCount = $event.target.files.length"
                            class="input-file">
                        <div v-if="status == 'initial'">Drag your file(s) here to begin<br><strong>or click to select a file</strong></div>
                        <div v-if="status == 'uploading'">
                            Uploading, please wait...
                            <v-progress-linear v-model="progressPercent"></v-progress-linear>
                        </div>
                    </div>
                </form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
function data () {
    return {
        status: 'initial',
        progressPercent: 0,
        visible: false
    }
}

const methods = {
    reset () {
        this.status = 'initial'
        this.progressPercent = 0
        if (this.$refs.fileupload) {
            this.$refs.fileupload.value = ''
        }
    },

    save (binary, filename) {
        this.status = 'uploading'
        this.$store.dispatch('uploadSoundFont', {
            binary,
            filename,
            progressCallback: (evt) => {
                this.progressPercent = Math.round((evt.loaded * 100) / evt.total)
            }
        })
        .then(() => {
            this.reset()
            this.visible = false
            this.$store.dispatch('snacks/add', {message: 'Upload successful'})
        })
        .catch(() => {
            this.reset()
            this.visible = false
        })
    },

    filesChange (files) {
        this.save(files[0], files[0].name)
    }
}

const watch = {
    show () {
        if (this.show && !this.visible) {
            this.reset()
        }
        this.visible = !!this.show
    },

    visible () {
        this.$emit('update:show', this.visible)
    }
}

export default {
    name: 'sound-upload',
    data,
    methods,
    watch,
    props: ['show'],
    mounted () {
        this.reset()
    }
}
</script>

<style scoped>
.dropbox {
    outline: 2px dashed #666;
    background: lightblue;
    color: #333;
    padding: 10px 10px;
    min-height: 150px;
    position: relative;
    cursor: pointer;
}

.dropbox:hover {
    background: #86c1d4;
}

.input-file {
    opacity: 0;
    width: 100%;
    height: 150px;
    position: absolute;
    cursor: pointer;
}

.dropbox > div {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
}

.progress {
    margin: 1em;
}
</style>
