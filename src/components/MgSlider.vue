<script>
import VSlider from '../../node_modules/vuetify/es5/components/VSlider/VSlider'

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

export default {
    name: 'mg-slider',
    extends: VSlider,
    computed: {
        trackStyles: function trackStyles() {
            var _ref2;

            var startDir = this.vertical ? this.$vuetify.rtl ? 'bottom' : 'top' : this.$vuetify.rtl ? 'left' : 'right';
            var endDir = this.vertical ? 'height' : 'width';
            var start = '0px';
            var end = '100%';
            return _ref2 = {
                transition: 'none',
            }, _defineProperty(_ref2, startDir, start), _defineProperty(_ref2, endDir, end), _ref2;
        },
        trackFillStyles: function trackFillStyles() {
            var _ref;

            var val = this.roundValue(this.internalValue / 2)
            var refAttr = val < 0 ? 'right' : 'left'
            val *= val < 0 ? -1 : 1
            var width = val + '%'

            return _ref = {
                transition: this.trackTransition
            }, _defineProperty(_ref, refAttr, '50%'), _defineProperty(_ref, 'width', width)
        },
    }
}
</script>
