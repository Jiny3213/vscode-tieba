// 没有类型定义
declare function acquireVsCodeApi():any 

// 储存回调函数
interface CallBacks {
  [propName: string]: any
}
const callbacks:CallBacks = {}
const vscode = acquireVsCodeApi()

// 发送消息
function callVscode(cmd: string, data?: any, cb?: Function) {
  const cbid = Date.now() + '' +  Math.round(Math.random() * 100000)
  let webviewMessage:WebviewMessage = {
    cmd: cmd,
    cbid: cbid
  }

  if(data) {
    webviewMessage.data = data
  }
  let resolveData: Function
  const promise = new Promise(resolve => {
    resolveData = resolve
  })

  callbacks[cbid] = (data: any) => {
    resolveData(data)
  }

  vscode.postMessage(webviewMessage)

  return promise
}

// 监听消息
window.addEventListener('message', event => {
  const message = event.data as CallbackMessage
  switch (message.cmd) {
    case 'vscodeCallback':
      (callbacks[message.cbid] || function() {})(message.data)
      delete callbacks[message.cbid]
      break
    default: break
  }
})

callVscode('sayHello').then(res => {
  console.log(res)
})