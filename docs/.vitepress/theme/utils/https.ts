// utils/http.js

import axios from 'axios';

// 创建 axios 实例
const axiosInstance = axios.create({
    baseURL: 'https://blogapi.afunny.top', // API 基础 URL
    timeout: 10000,  // 请求超时时间
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
// axiosInstance.interceptors.request.use(
//     (config) => {
//         // 可以在这里处理请求前的逻辑，例如添加 token 或其他自定义请求头
//         const token = localStorage.getItem('token'); // 假设你把 token 存储在 localStorage
//         if (token) {
//             config.headers['Authorization'] = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response) => {
        // 你可以在这里处理返回的数据，例如根据状态码做统一处理
        console.log(response.data, 'https-33')
        return response.data;
    },
    (error) => {
        // 统一错误处理
        if (error.response) {
            // 请求已发出，服务器响应了状态码，但状态码不在 2xx 范围内
            console.error('Response error:', error.response);
            switch (error.response.status) {
                case 401:
                    console.log('Unauthorized! Please log in again.');
                    // 处理未授权的错误，例如跳转到登录页面
                    break;
                case 404:
                    console.log('Resource not found.');
                    break;
                default:
                    console.log('Something went wrong');
            }
        } else if (error.request) {
            // 请求已发出，但没有收到响应
            console.error('Request error:', error.request);
        } else {
            // 在设置请求时发生了错误
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// 封装的 GET 请求
const get = (url, params = {}) => {
    return axiosInstance.get(url, { params });
};

// 封装的 POST 请求
const post = (url, data = {}) => {
    return axiosInstance.post(url, data);
};

// 封装的 PUT 请求
const put = (url, data = {}) => {
    return axiosInstance.put(url, data);
};

// 封装的 DELETE 请求
const del = (url, data = {}) => {
    return axiosInstance.delete(url, { data });
};

// 导出封装的请求方法
export {
    get,
    post,
    put,
    del,
};
