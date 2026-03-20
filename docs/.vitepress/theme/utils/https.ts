// utils/https.ts - 使用原生 fetch 替代 axios

const BASE_URL = 'https://blogapi.afunny.top'

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string>
}

async function request<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, params } = config
  
  // 构建完整 URL
  let fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString()
    fullUrl += `?${queryString}`
  }
  
  const response = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json() as Promise<T>
}

// 封装请求方法
async function get<T>(url: string, params?: Record<string, string>): Promise<T> {
  return request<T>(url, { method: 'GET', params })
}

async function post<T>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, { method: 'POST', body: data })
}

async function put<T>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, { method: 'PUT', body: data })
}

async function del<T>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, { method: 'DELETE', body: data })
}

// 导出封装的请求方法
export {
  get,
  post,
  put,
  del,
}
