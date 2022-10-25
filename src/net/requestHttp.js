/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2022-10-21 15:24:25
 * @LastEditors: 袁康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2022-10-21 15:48:08
 * @FilePath: \RN-MultiBundler-UI\src\net\requestHttp.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios';
const instance = axios.create({
    baseURL: 'https://filestorage.yunexpress.com',
    timeout: 20000
});

const defaultHeaders = {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "multipart/form-data;",
}

const getUploadUrl = (fileName) => '/yunexpress-fileupload/PDA/' + fileName

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

//返回拦截处理
instance.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
    // return Promise.resolve(error);
});


/**
 * post
 * @param {*} api 
 * @param {*} body 
 * @param {*} config 
 */
export const uploadFile = async (api, body = {}, config = defaultHeaders) => {
    // myLog(body);
    // let fd = new FormData();
    // let file = {
    //     uri: image.uri,
    //     name: image.name,
    //     type: 'multipart/form-data',
    // }
    // fd.append('file', file)
    return new Promise((resolve, reject) => {
        instance.post(api, body, { ...defaultHeaders, ...config })
            .then(res => {
                resolve(res?.data)
            }).catch(err => {
                reject(err)
            })
    })
}