// 官方文档 https://code.visualstudio.com/api
import * as vscode from 'vscode';
import { openPostView } from './command/openPostView'
import { ThreadProvider, ThreadNode } from './provider/ThreadProvider'
import { setCookie } from './api/axios'

export function activate(context: vscode.ExtensionContext) {
  console.log('tieba is now active!');

  // 我的吧持久化
  let defaultBaList = ['javascript', 'python'] // 默认关注的吧
  let baList: string[] = context.globalState.get('baList') || []
  if (!baList.length) {
    context.globalState.update('baList', defaultBaList)
    baList = defaultBaList
  }

  // cookie 持久化
  let cookie: string = context.globalState.get('cookie') || ''
  console.log('当前cookie：', cookie)
  setCookie(cookie)

  // 注册「打开 webview」命令
  context.subscriptions.push(openPostView(context))

  // 注册命令的示例，搜索「tieba.sayHello」查看命令调用的位置
  context.subscriptions.push(vscode.commands.registerCommand('tieba.sayHello', function (e) {
    console.log(e)
    vscode.window.showInformationMessage('tieba example：Hello World!');
  }));

  // 创建树
  let threadProvider = new ThreadProvider(baList)
  vscode.window.createTreeView(
    'tieba-index',
    {
      treeDataProvider: threadProvider
    }
  )

  // 刷新帖子列表
  vscode.commands.registerCommand('tieba-index.refresh', (node: ThreadNode) => {
    threadProvider.refresh(node)
  })

  // 删除吧
  vscode.commands.registerCommand('tieba.delete', (node: ThreadNode) => {
    console.log('delete', node.label)
    baList = baList.filter(item => item !== node.label)
    context.globalState.update('baList', baList)
    threadProvider = new ThreadProvider(baList)
    vscode.window.createTreeView(
      'tieba-index',
      {
        treeDataProvider: threadProvider
      }
    )
  })

  // 增加一个吧
  vscode.commands.registerCommand('tieba.add', (node: ThreadNode) => {
    vscode.window.showInputBox({
      placeHolder: '添加贴吧'
    }).then(baName => {
      if (baName) {
        baList.push(baName)
        context.globalState.update('baList', baList)
        threadProvider = new ThreadProvider(baList)
        vscode.window.createTreeView(
          'tieba-index',
          {
            treeDataProvider: threadProvider
          }
        )
      }
    })
  })

  // 修改cookie
  vscode.commands.registerCommand('tieba.cookie', (node: ThreadNode) => {
    vscode.window.showInputBox({
      placeHolder: '输入贴吧cookie'
    }).then(cookie => {
      if (cookie) {
        context.globalState.update('cookie', cookie)
        setCookie(cookie)
        console.log('setCookie: ', cookie)
      }
    })
  })

  // 用浏览器打开帖子
  vscode.commands.registerCommand('tieba.openExternal', (node: ThreadNode) => {
    const uri = vscode.Uri.parse(node.thread!.href)
    vscode.env.openExternal(uri)
  })
}

export function deactivate() {
  console.log('deactivate')
}
