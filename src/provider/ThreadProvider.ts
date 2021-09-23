import * as vscode from 'vscode';
import {getThreadList} from '../api/index'

export class ThreadProvider implements vscode.TreeDataProvider<ThreadNode> {
  public baList: ThreadNode[] = []
  constructor(baList: string[]) {
    this.baList = baList.map(item => {
      return new ThreadNode(item, true)
    })
  }
  getTreeItem(element: ThreadNode):vscode.TreeItem {
    return element
  }
  async getChildren(element?: ThreadNode): Promise<ThreadNode[]> {
    // 生成根节点
    if(!element) { 
      return Promise.resolve(this.baList)
    }
    else {
      // 展开帖子列表
      if(element.isRoot) {
        const threadList = await getThreadList(element.label)
        let nodeList: ThreadNode[] = []
        for(let item of threadList) {
          let threadNode = new ThreadNode(item.title, false, item)
          // 点击一个帖子的标题, 在编辑器打开对应的帖子
          threadNode.command = {
            title: 'openPostView',
            command: 'tieba.openPostView',
            tooltip: 'openPostView',
            arguments: [threadNode.thread]
          };
          nodeList.push(threadNode)
        }
        return Promise.resolve(nodeList)
      }
      else {
        console.log(element.thread!.href)
        return Promise.resolve([])
      }
    }
  }
  private _onDidChangeTreeData: vscode.EventEmitter<ThreadNode | undefined> = new vscode.EventEmitter<ThreadNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<ThreadNode | undefined> = this._onDidChangeTreeData.event;

  // 刷新帖子
  async refresh(node:ThreadNode) {
    this._onDidChangeTreeData.fire(node);
  }
}

export class ThreadNode extends vscode.TreeItem {
  constructor (
    public label: string,
    public isRoot: boolean,
    public thread?: ThreadItem
    ) {
    super(label, isRoot ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None)
    this.isRoot = isRoot,
    this.thread = thread
    // view/item/context 中的when可以通过viewItem取到
    this.contextValue = isRoot ? '1' : '0'
  }
}