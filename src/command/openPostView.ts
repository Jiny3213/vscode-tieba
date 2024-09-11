import * as vscode from 'vscode';
import { getWebViewContent, MethodHandler } from '../utils/commandUtils'
import { getPostList } from '../api/index'

export function openPostView(context: vscode.ExtensionContext) {
  // 注册「打开页面」命令，将会在其他地方调用这个命令
  return vscode.commands.registerCommand('tieba.openPostView', async (thread: ThreadItem) => {
    const panel = vscode.window.createWebviewPanel(
      'post',
      thread.title,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    )
    const handler = new MethodHandler(context, panel)
    handler.messageHandler = {
      sayHello(message) {
        console.log('sayHello in openPostView')
        return Promise.resolve('had call sayHello')
      },
      getPostList(payload) {
        const { data: { page } } = payload
        return getPostList(thread.href, page)
      },
      log(message) {
        console.log(message)
        return Promise.resolve(message)
      }
    }

    try {
      panel.webview.html = getWebViewContent(context, panel, 'src/views/post/post.html')
    } catch (err) {
      console.error(err) // 容易发生文件引用错误
    }
  })
}