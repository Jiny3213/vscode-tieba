import {getWebViewContent} from '../utils/commandUtils'
import * as vscode from 'vscode';
import {getThreadList} from '../api/index'

export function thread(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('tieba.thread', () => {
    const panel = vscode.window.createWebviewPanel(
      'thread',
      '帖子列表',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    )
    
    panel.webview.html = getWebViewContent(context, panel, 'src/views/index/index.html')
  
    // 供webview调用的方法
    interface MessageHandlerItem {
      (message: WebviewMessage): Promise<any>
    }

    interface MessageHandler {
      [propName: string]: MessageHandlerItem
    }

    const messageHandler:MessageHandler = {
      async sayHello(message) {
        console.log('hello')
        return 'had call sayHello'
      },
  
      // 获取贴吧首页帖子列表
      async getIndexPage(message) {
        const baName = message.data.baName
        return getThreadList(baName)
      }
    }
  
    // 监听消息
    panel.webview.onDidReceiveMessage((message: WebviewMessage) => {
      if(messageHandler[message.cmd]) {
        messageHandler[message.cmd](message).then(data => {
          // 无论如何, 调用回调函数
          invokeCallback(message, data) 
        })
      }
      else {
        console.log(`未找到名为${message.cmd}的方法`)
      }
    }, undefined, context.subscriptions)
    
    // 调用webView的回调函数
    function invokeCallback(message: WebviewMessage, data: any) {
      const callbackMessage:CallbackMessage = {
        cmd: 'vscodeCallback',
        cbid: message.cbid,
        data: data
      }
      panel.webview.postMessage(callbackMessage)
    }
  })
} 