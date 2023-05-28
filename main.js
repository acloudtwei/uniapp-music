import Vue from 'vue'
import App from './App'
import store from './store'

Vue.config.productionTip = false

App.mpType = 'app'

// 设置vue对象中隐藏的属性api,这样在使用的时候可以直接this.$api
import api from "@/api/index"
Vue.prototype.$api = api;

import musicControl from "@/components/musicControl/index.vue"
Vue.component('music-control', musicControl)

import boxTitle from "@/components/boxTitle/index.vue"
Vue.component('box-title', boxTitle)

import tabBar from "@/components/tabBar/index.vue"
Vue.component('tab-bar', tabBar)

import cuCustom from './colorui/components/cu-custom.vue'
Vue.component('cu-custom', cuCustom)

import {audio} from '@/plugins/audio/index.js'
Vue.prototype.$audio = audio

import uView from '@/node_modules/uview-ui'
Vue.use(uView)
uni.$u.setConfig({
	config: {
		unit: 'rpx'
	},
	props: {
		radio: {
			size: 15
		}
	}
})

const app = new Vue({
	...App,
	store
})

app.$mount()
