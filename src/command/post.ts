import * as vscode from 'vscode';
import {getWebViewContent} from '../utils/commandUtils'

// 展示某个帖子
export function post(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('tieba.post', () => {
    const panel = vscode.window.createWebviewPanel(
      'post',
      '帖子详情',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    )
    panel.webview.html = getWebViewContent(context, panel, 'src/views/post/post.html')
  })
}