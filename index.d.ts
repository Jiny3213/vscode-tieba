// 公共定义

interface WebviewMessage {
  cmd: string, // 调用messageHandler的方法名
  cbid: string, // 需要回调函数时, 保存在webview的回调函数id
  data?: any // 其他数据字段
}

interface CallbackMessage {
  cmd: string, // 回调指令, 通常为vscodeCallback
  cbid: string, // webview回调函数id
  data: any // 任意的回调字段
}

declare interface ThreadItem {
  title: string, // 帖子的标题
  href: string, // 帖子的链接
  images?: Array<string> // 帖子的图
}
