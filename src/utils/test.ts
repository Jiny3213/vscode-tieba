
import * as fs from 'fs'
import * as path from 'path'

export function saveObj(obj: object) {
  let text = ''
  text += 'export default {\n'
  Object.entries(obj).forEach(([key, value]) => {
    text += `'${key}': '${value}',\n`
  })
  text += '}\n'
  fs.writeFileSync(path.join(__dirname, `../../testData/tmp/${new Date().getTime()}.mjs`), text)
}