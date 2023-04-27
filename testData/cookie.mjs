// import oldone from './tmp/1682584009016.mjs'
// import newone from './tmp/1682584020630.mjs'

import oldone from './tmp/1682585672335.mjs'
import newone from './tmp/1682586288817.mjs'

// 比较cookie之间的差别
function compareObject(a, b) {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  console.log('--start--')
  for(let key of keysB) {
    if(keysA.includes(key)) {
      if(a[key] !== b[key]) {
        console.log(`${key} 存在不一致的value，前者为 ${a[key]}，后者为 ${b[key]}`)
      }
    } else {
      console.log(`后者多了一个 ${key}: ${b[key]}`)
    }
  }
  for(let key of keysA) {
    if(!keysB.includes(key)) {
      console.log(`后者少了一个 ${key}: ${a[key]}`)
    }
  }
  console.log('--end--')
}

compareObject(oldone, newone)

// 经常变更：tb_as_data，Hm_lpvt_98b9d8c2fd6608d564bf2ac2ae642948