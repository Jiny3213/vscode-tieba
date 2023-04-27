import axios from 'axios'
import * as vscode from 'vscode';
import * as fs from 'fs'
import * as path from 'path'

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

instance.interceptors.response.use(res => {
  console.log('响应：', res)
  console.log('setCookie: ', res.headers['set-cookie'])
  if(res.headers['set-cookie']) {
    const cookieList: string[] = res.headers['set-cookie']
    cookieList.forEach(item => {
      instance.defaults.headers.cookie = Object.assign(instance.defaults.headers.cookie, parseCookie(item))
    })
  }
  if(/static\/captcha\/tuxing\.html/.test(res.request.path)) {
    console.log('触发百度安全验证')
    vscode.window.showErrorMessage('触发百度安全验证，请打开浏览器验证，并重新获取cookie')
  }
  // fs.writeFileSync(path.join(__dirname, `../../testData/${new Date().getTime()}`), res.data)
  return res
}, res => {
  console.log('响应error：', res)
  return res
})

export default instance

export function setCookie(cookie: string) {
  instance.defaults.headers.cookie = cookie
}

function parseCookie(cookie: string) {
  const cookieObj: Record<string, string> = {}
  cookie.split(';').forEach(item => {
    const keyValue = item.split('=')
    const [key, value] = keyValue
    const keyNotCookie = ['path', 'expires', 'domain']
    if(!keyNotCookie.includes(key.trim().toLowerCase())) {
      cookieObj[key.trim()] = value.trim()
    }
  })
  return cookieObj
}
