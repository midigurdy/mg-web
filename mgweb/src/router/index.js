import Vue from 'vue'
import Router from 'vue-router'

import Help from '@/components/Help'
import ConfigMapping from '@/components/config/Mapping'
import ConfigKeyCalibration from '@/components/config/KeyCalibration'
import WheelCalibrate from '@/components/config/WheelCalibrate'

import Visualization from '@/components/Visualization'

import PresetsIndex from '@/components/presets/Index'
import PresetsList from '@/components/presets/List'
import PresetsReorder from '@/components/presets/Reorder'
import PresetEdit from '@/components/presets/Edit'

import SoundsIndex from '@/components/sounds/Index'
import SoundfontList from '@/components/sounds/SoundfontList'
import SoundfontDetails from '@/components/sounds/SoundfontDetails'

import InstrumentState from '@/components/state/InstrumentState'
import MiscConfig from '@/components/config/MiscConfig'

import ImportExport from '@/components/config/ImportExport'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/instrument'
        },
        {
            path: '/help',
            component: Help
        },
        {
            path: '/instrument',
            component: InstrumentState
        },
        {
            path: '/key-calibration',
            component: ConfigKeyCalibration,
            name: 'key-calibration'
        },
        {
            path: '/wheel-calibration',
            component: WheelCalibrate,
            name: 'wheel-calibration'
        },
        {
            path: '/mapping/:mapname',
            component: ConfigMapping,
            name: 'config-mapping'
        },
        {
            path: '/visualization',
            component: Visualization
        },
        {
            path: '/presets',
            component: PresetsIndex,
            children: [
                {
                    path: '',
                    component: PresetsList,
                    name: 'preset-list'
                },
                {
                    path: 'reorder',
                    component: PresetsReorder,
                    name: 'presets-reorder',
                    meta: {toolbarTitle: 'Reorder Presets'}
                },
                {
                    path: ':presetId',
                    component: PresetEdit,
                    name: 'preset-edit'
                }
            ]
        },
        {
            path: '/sounds',
            component: SoundsIndex,
            children: [
                {
                    path: '',
                    component: SoundfontList,
                    name: 'soundfont-list'
                },
                {
                    path: ':soundfontId',
                    component: SoundfontDetails,
                    name: 'soundfont-details'
                }
            ]
        },
        {
            path: '/misc',
            component: MiscConfig
        },
        {
            path: '/export',
            component: ImportExport
        }
    ],
    mode: 'history',
    linkActiveClass: 'active'
})
