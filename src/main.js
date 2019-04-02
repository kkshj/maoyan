// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import App from './App'
import router from './router'
import Echarts from 'echarts'

import 'element-ui/lib/theme-chalk/index.css'
import '../static/basic.css'
import "babel-polyfill";

// mavonEditor
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

Vue.use(mavonEditor)
Vue.use(ElementUI, {size: 'small'})

Vue.prototype.$echarts = Echarts;

// Vue.component('chart', ECharts)

Vue.config.productionTip = false
// https://hlwyyssl.jkscw.com.cn
// http://api.schlwyy.com'
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
