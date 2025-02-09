// /.netlify/functions/logs
import { post } from './https'
import { generateUUID } from './index'


const LOCAL_UUID_KEY = 'uuid'
const reportLogs = (data) => {
    let uuid = localStorage.getItem(LOCAL_UUID_KEY)
    // 评论里的用户信息
    let twikoo = localStorage.getItem('twikoo')
    
    if (!uuid) {
        uuid = generateUUID()
        localStorage.setItem(LOCAL_UUID_KEY, uuid)
    }
    post('/.netlify/functions/logs', { ...data, uuid, twikoo })
}

const reportLogsWithImpr = (data) => {
    reportLogs({ ...data, type: 'impr' })
}

const reportLogsWithClick = (data) => {
    reportLogs({ ...data, type: 'click' })
}


export {
    reportLogs,
    reportLogsWithImpr,
    reportLogsWithClick
}