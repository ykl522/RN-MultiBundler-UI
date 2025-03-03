/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2022-10-21 15:24:25
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2023-08-03 09:59:50
 */
import axios from 'axios';
// axios.defaults.adapter = require('axios/lib/adapters/http');

// 上传文件超时3分钟
const instance = axios.create({
    baseURL: "",
    timeout: 180000
});

const defaultHeaders = {
    headers: {
        "Content-Type": "multipart/form-data;",
    }
}

// 获取上传文件地址
export const getUploadUrl = (uploadHost, fileName, dir) => `${uploadHost}/${dir || 'PDA'}/` + fileName

//请求拦截处理
instance.interceptors.request.use(function (config) {
    // config.headers = {
    // 	...config.headers,
    // }
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// //返回拦截处理
instance.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    console.log(JSON.stringify(response))
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
    // return Promise.resolve(error);
});


/**
 * post上传文件
 * @param {string} url 
 * @param {string} fileName 
 * @param {string} uri 
 * @param {Function} [onProgress] 
 * @param {object} [body] 
 * @param {object} [config] 
 */
export const uploadFile = async (url, fileName, uri, onProgress, body = {}, config = defaultHeaders) => {
    if (url) {
        let fd = new FormData();
        const fs = require('fs')
        let fileBlob = fs.readFileSync(uri)
        fd.append('file', new Blob([fileBlob]), fileName)
        let httpUrl = new URL(url)
        updateOpaUrl(httpUrl.origin)
        return new Promise((resolve, reject) => {
            instance.post(httpUrl.pathname, fd, {
                defaultHeaders,
                onUploadProgress: ({ loaded, total }) => {
                    if (onProgress) onProgress(loaded / total)
                },
                // ...config
            }).then(res => {
                resolve(res.data)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

/**
 * 更新域名
 * @param {string} url 
 */
const updateOpaUrl = (url) => {
    if (url) instance.defaults.baseURL = url
}

/**
 * 
 * @param {string} url 
 * @param {object?} [body] 
 * @param {object?} [config] 
 */
export const post = async (url, body = {}, config) => {
    if (url) {
        let httpUrl = new URL(url + '')
        updateOpaUrl(httpUrl.origin)
        return new Promise((resolve, reject) => {
            instance.post(httpUrl.pathname, body,
                config ? config : {
                    headers: {
                        "Content-Type": "application/json;charset=utf-8",
                        "Access_token": "Basic MGM0ZWU3YWZiNTkyZWM3NThiMTU0ZDY3NDE3NTVmODEmQWRtaW4=",
                        "userToken": "token",
                        "Authorization": "bxqhN0HZB4b5HbYk"
                    },
                }
            ).then(res => {
                if (res) resolve(res.data)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

/**
 * get请求
 * @param {string} url 
 * @param {object} [config]
 */
export const get = async (url, config = {}) => {
    if (url) {
        let httpUrl = new URL(url + '')
        updateOpaUrl(httpUrl.origin)
        // alert(JSON.stringify(httpUrl.origin))
        return new Promise((resolve, reject) => {
            instance.get(httpUrl.pathname,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Access_token": "Basic MGM0ZWU3YWZiNTkyZWM3NThiMTU0ZDY3NDE3NTVmODEmQWRtaW4=",
                        "Authorization": "Nebula token:375152220c324ede9a88741f2bc18e4e"
                    },
                    // ...config
                }
            ).then(res => {
                if (res) resolve(res.data)
            }).catch(err => {
                reject(err)
            })
        })
    }
}