import axios from 'axios'
import * as vscode from 'vscode';

console.log('windowState', vscode.window.state)
const instance = axios.create({
  headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36 FS',
    cookie: '',
    origin: 'tieba.baidu.com',
    host: 'tieba.baidu.com'
  },
})

instance.interceptors.request.use(config => {
  console.log('请求：', config)
  return config
})

export default instance

export function setCookie(cookie: string) {
  instance.defaults.headers.cookie = cookie
}