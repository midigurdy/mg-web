<script>
import VSlider from '../../node_modules/vuetify/es5/components/VSlider/VSlider'

export default {
    name: 'mg-slider',
    extends: VSlider,
    computed: {
        classes () {
            return {
                'input-group--slider': true,
                'input-group--active': this.isActive,
                'input-group--dirty': this.inputWidth !== 50,
                'input-group--disabled': this.disabled,
                'input-group--ticks': !this.disabled && this.stepNumeric && this.ticks
            }
        },
        computedThumbColor () {
            return (this.disabled || !this.inputValue) ? null : (this.thumbColor || this.color || this.defaultColor)
        },
        trackStyles () {
            return {
                transition: 'none',
                left: 0,
                width: '100%'
            }
        },
        trackFillStyles () {
            var width = this.roundValue(this.inputValue / 2)
            if (width < 0) {
                return {
                    transition: this.keyPressed >= 2 ? 'none' : '',
                    left: `${50 + width}%`,
                    width: `${0 - width}%`
                }
            } else {
                return {
                    transition: this.keyPressed >= 2 ? 'none' : '',
                    left: '50%',
                    width: `${width}%`
                }
            }
        }
    }

}
</script>
