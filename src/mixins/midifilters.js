export default {
    filters: {
        yesNo (val) {
            return val ? 'Yes' : 'No'
        },

        nl2br (val) {
            return val.replace(/\n/g, '<br/>')
        },

        escapeHtml (val) {
            return document.createElement('div')
                .appendChild(document.createTextNode(val))
                .parentNode
                .innerHTML
        },

        capfirst (string) {
            if (!string) return string
            return string.charAt(0).toUpperCase() + string.slice(1)
        },

        humanizedSize (val) {
            var i = -1
            const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
            do {
                val = val / 1000
                i++
            } while (val > 1000)

            return Math.max(val, 0.1).toFixed(1) + byteUnits[i]
        },

        midiNote (val) {
            if (!val || val === '' || val === -1) {
                return '-'
            }
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            var note = notes[val % 12]
            var octave = parseInt(val / 12, 10) - 5
            if (octave === 0) {
                return note
            } else if (octave > 0) {
                return note + ' (+' + octave + ')'
            } else {
                return note + ' (' + octave + ')'
            }
        },

        midiBaseNote (val) {
            if (val === '' || val === -1) {
                return '-'
            }
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            return '' + notes[val % 12]
        },

        midiOctave (val) {
            if (val === '' || val === -1) {
                return '-'
            }
            var octave = parseInt(val / 12, 10) - 5
            if (octave === 0) {
                return '0'
            } else {
                return (octave > 0 ? '+' : '') + octave
            }
        },

        midiPercent (val) {
            if (val === undefined) {
                return '-'
            }
            return Math.round(val * (100 / 127)) + '%'
        },

        midiPanning (val) {
            var pan

            if (val === 64) {
                return 'Center'
            }
            if (val === 127) {
                pan = 100
            } else {
                pan = Math.round((val - 64) * (100 / 64))
            }
            return (pan < 0 ? 'Left' : 'Right') + ' ' + (pan < 0 ? -pan : pan) + '%'
        },

        soundType (val) {
            if (val.type === 'melody') {
                return 'Mel'
            } else if (val.type === 'drone') {
                return 'Dro'
            } else if (val.type === 'trompette') {
                return 'Trp'
            } else if (val.type === 'keynoise') {
                return 'Key'
            } else {
                return 'G'
            }
        }
    }
}
