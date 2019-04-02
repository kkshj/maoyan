import Vue from 'vue'
import Axios from 'axios'
const version =  '01.00.00';
const platform = 'MANAGEMENT';
import conf from '../config.json'
export default {
  get (url, params) {
    if (url.indexOf('?') >= 0) {
      url = `${url}&timestep${new Date()}`
    } else {
      url = `${url}?timestep${new Date()}`
    }
    if (!params)  {
      params = {
        headers: {}
      }
    }
    params.headers.version = version;
    params.headers.platform = platform;
    return new Promise((resolve, reject) => {
      Axios.get(url, params).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  },
  post (url, body, params) {
    if (!params)  {
      params = {
        headers: {}
      }
    }
    params.headers.version = version;
    params.headers.platform = platform;
    return new Promise((resolve, reject) => {
      Axios.post(url, body, params).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  },
  put (url, body, params) {
    if (!params)  {
      params = {
        headers: {}
      }
    }
    params.headers.version = version;
    params.headers.platform = platform;
    return new Promise((resolve, reject) => {
      Axios.put(url, body, params).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  },
  delete (url, params) {
    if (!params)  {
      params = {
        headers: {}
      }
    }
    params.headers.version = version;
    params.headers.platform = platform;
    return new Promise((resolve, reject) => {
      Axios.delete(url, params).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  },
  refreshToken(){
       const url=`${conf.url}/users/channels/internet-hospital/token`
             const refresh_token = JSON.parse(localStorage.getItem('userInfo')).refresh_token;
          return new Promise((resolve,reject)=>{
            Axios.post(url,{"refreshToken": refresh_token}).then(res=>{
              resolve(res)
            }).catch(err=>{
                reject(err)
            })
          })
}

}
