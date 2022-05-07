import Vue from 'vue'
import axios from 'axios'
import config from './config'

axios.defaults.baseURL = config.api;
axios.defaults.timeout = 2000;

// axios.interceptors.request.use(function (config) {
//   // console.log(config);
//   return config;
// })
axios.loadData = async function(url){
  const resp = await axios.get(url);
  return resp.data;
}
// 将axios添加到Vue的原型,这样一切vue实例都可以使用该对象
Vue.prototype.$http = axios;
