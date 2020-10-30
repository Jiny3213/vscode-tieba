import * as path from 'path'
import * as vscode from 'vscode';
import * as fs from 'fs'

// 方法参考 http://blog.haoji.me/vscode-plugin-webview.html
// 获取静态资源
export function getWebViewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, htmlPath: string) {
  const resourcePath = path.join(context.extensionPath, htmlPath)
  let html = fs.readFileSync(resourcePath, 'utf-8')
  // 静态资源路径转换,引用ts的路径需要写out/中的js
  html = html.replace(/(<link.+?href="|<script.+?src=")(.+?)"/g, (m, $1, $2) => {
    const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, $2))
    const webViewPath = panel.webview.asWebviewUri(onDiskPath)
    return $1 + webViewPath + '"'
  });
  return html;
}

interface MessageHandler {
  [propName: string]: (message: WebviewMessage) => Promise<any>
}

export class MethodHandler {
  // 供webview调用的方法
  public messageHandler: MessageHandler
  public panel: vscode.WebviewPanel
  public context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
    this.context = context
    this.panel = panel
    this.messageHandler = {}
    this.init()
    
  }
  // const messageHandler:MessageHandler = {
  //   sayHello(message: any) {
  //     console.log('hello')
  //     invokeCallback(message, 'had call sayHello')
  //   },

  //   // 获取贴吧首页帖子列表
  //   getIndexPage(message: any) {
  //     const baName = message.baName
  //     getTopicList(baName).then(result => {
  //       invokeCallback(message, result)
  //     })
  //   }
  // }

  init() {
    // 监听消息
    this.panel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      if(this.messageHandler[message.cmd]) {
        const result = await this.messageHandler[message.cmd](message)
        this.invokeCallback(message, result) // 自动回调
      }
      else {
        console.log(`未找到名为${message.cmd}的方法`)
      }
    }, undefined, this.context.subscriptions)
  }
  
  
  // 调用webView的回调函数
  invokeCallback(message: any, res: any) {
    this.panel.webview.postMessage({cmd: 'vscodeCallback', cbid: message.cbid, data: res})
  }
}