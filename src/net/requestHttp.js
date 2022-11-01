/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2022-10-21 15:24:25
 * @LastEditors: 袁康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2022-10-28 16:58:52
 * @FilePath: \RN-MultiBundler-UI\src\net\requestHttp.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios';

const instance = axios.create({
    baseURL: "https://filestorage.yunexpress.com",
    timeout: 20000
});

const defaultHeaders = {
    headers: {
        "Content-Type": "multipart/form-data;",
    }
}

//https://filestorage.yunexpress.com/yunexpress-fileupload/PDA/1.2.0_YT_pro.apk
export const getUploadUrl = (fileName) => 'https://filestorage.yunexpress.com/yunexpress-fileupload/PDA/' + fileName

//请求拦截处理
// instance.interceptors.request.use(function (config) {
//     // config.headers = {
//     // 	...config.headers,
//     // }
//     // 在发送请求之前做些什么
//     return config;
// }, function (error) {
//     // 对请求错误做些什么
//     return Promise.reject(error);
// });

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
export const post = async (url, body = {}, config = {}) => {
    let httpUrl = new URL(url + '')
    updateOpaUrl(httpUrl.origin)
    return new Promise((resolve, reject) => {
        instance.post(httpUrl.pathname, body,
            {
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Access_token": "Basic MGM0ZWU3YWZiNTkyZWM3NThiMTU0ZDY3NDE3NTVmODEmQWRtaW4=",
                    "userToken": "token"
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

/**
 * get请求
 * @param {string} url 
 * @param {object} [config]
 */
export const get = async (url, config = {}) => {
    let httpUrl = new URL(url + '')
    updateOpaUrl(httpUrl.origin)
    // alert(JSON.stringify(httpUrl.origin))
    return new Promise((resolve, reject) => {
        instance.get(httpUrl.pathname,
            {
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Access_token": "Basic MGM0ZWU3YWZiNTkyZWM3NThiMTU0ZDY3NDE3NTVmODEmQWRtaW4="
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