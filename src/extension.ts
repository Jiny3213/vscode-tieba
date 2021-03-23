// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// 官方文档 https://code.visualstudio.com/api
import * as vscode from 'vscode';
import {thread} from './command/thread'
import {openPostView} from './command/openPostView'
import {ThreadProvider, ThreadNode} from './provider/ThreadProvider'

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "tieba" is now active!');
	context.globalState.update('test', '666')
	// 帖子列表
	context.subscriptions.push(thread(context))

	// 打开帖子
	context.subscriptions.push(openPostView(context))

	// 创建树
	const threadProvider = new ThreadProvider()
	vscode.window.createTreeView(
		'tieba-index',
		{
			treeDataProvider: threadProvider
		}
	)
	
	// 测试多个treeView
	const otherProvider = new ThreadProvider()
	vscode.window.createTreeView(
		'tieba-other',
		{
			treeDataProvider: threadProvider
		}
	)

	// 刷新帖子列表
	vscode.commands.registerCommand('tieba-index.refresh', (node: ThreadNode) => {
		threadProvider.refresh(node)
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
