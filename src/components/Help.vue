<template>
<v-container>
    <mg-toolbar title="Help"/>
    <v-card>
        <v-card-title><h2>Where to get help</h2></v-card-title>
        <v-card-text>
            <h2 class="pt-2">MidiGurdy User Manual</h2>
            <p><a href="/manual/en/html/index.html" target="_blank">Offline version of the User Manual</a></p>
            <p><a href="https://midigurdy.com/manual-latest/en/html/index.html" target="_blank">Latest online version of the User Manual</a></p>

            <h2 class="pt-2">Other resources</h2>
            <p>For support about all MidiGurdy related topics please use the MidiGurdy Forum at <a href="https://forum.midigurdy.com" target="_blank">forum.midigurdy.com</a>.</p>
            <p>Alternatively, contact information can be found on <a href="http://midigurdy.com" target="_blank">midigurdy.com</a>.</p>
        </v-card-text>
    </v-card>
</v-container>
</template>

<script>
export default {
    name: 'about'
}
</script>
