
import * as fs from 'fs'
import * as path from 'path'

// 保存js对象到测试目录
export function saveObj(obj: object) {
  let text = ''
  text += 'export default {\n'
  Object.entries(obj).forEach(([key, value]) => {
    text += `'${key}': '${value}',\n`
  })
  text += '}\n'
  fs.writeFileSync(path.join(__dirname, `../../testData/tmp/${new Date().getTime()}.mjs`), text)
}

// 保存文本到测试目录
export function saveText(fileName: string, text: string) {
  fs.writeFileSync(path.join(__dirname, '../../testData/tmp', fileName), text)
}