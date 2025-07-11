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
    console.log("请求拦截处理-config:", config)
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
export const uploadFile = async (url, fileName, uri, onProgress, config = defaultHeaders) => {
    if (url) {
        let fd = new FormData();
        const fs = require('fs')
        let fileBlob = fs.readFileSync(uri)
        fd.append('files', new Blob([fileBlob]), fileName)
        fd.append('Content-Type', 'image/*')
        let httpUrl = new URL(url)
        updateOpaUrl(httpUrl.origin)
        console.log(config)
        return new Promise((resolve, reject) => {
            instance.post(httpUrl.pathname, fd, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent && progressEvent.total) {
                        console.log('progressEvent-->', progressEvent)
                        if (onProgress) onProgress(progressEvent.loaded / progressEvent.total)
                    }
                },
                headers: Object.assign({}, config.headers, defaultHeaders.headers)
            }).then(res => {
                if (res && res.code === 200) {
                    console.log('res成功-->', res)
                    resolve(res.data)
                } else {
                    reject(res.data)
                }
            }).catch(err => {
                reject(err)
            })
        })
    }
}

export const downloadFile = async (url, progressCallback, dataCallback) => {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // console.log(`下载进度: ${percent}%`);
            if (progressCallback) {
                progressCallback(percent);
            }
        },
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        params: {
            // 添加额外的随机参数
            rand: Math.random().toString(36).substring(7)
        }
    });
    const arraybuffer = response.data;
    // downloadBlob(blob, url.split('/').pop()); // 使用文件名作为下载的文件名
    if (dataCallback) {
        dataCallback(arraybuffer);
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
        return new Promise((resolve, reject) => {
            instance.get(httpUrl.pathname,
                config ? config : {
                    headers: {
                        "Content-Type": "application/json",
                        "Access_token": "Basic MGM0ZWU3YWZiNTkyZWM3NThiMTU0ZDY3NDE3NTVmODEmQWRtaW4=",
                        "Authorization": "Nebula token:375152220c324ede9a88741f2bc18e4e"
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