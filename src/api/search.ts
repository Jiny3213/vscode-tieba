import axios from './axios'
import * as fs from 'fs'
import * as path from 'path'
import * as iconv from 'iconv-lite'
import * as cheerio from 'cheerio'

export function search(params: any) {
  // 这个接口返回的数据编码是gbk
  return axios.get('https://tieba.baidu.com/f/search/res', {
    params,
    responseType: "arraybuffer" 
  }).then(res => {
    const html = iconv.decode(res.data, 'GBK')
    const $ = cheerio.load(html)
    let threadList: ThreadItem[] = []
    $('.s_post').each((index, item) => {
      const titleNode = $(item).find('.p_title a')
      threadList.push({
        title: titleNode.text(),
        href: 'https://tieba.baidu.com' + titleNode.attr('href')
      })
    })
    console.log('searchThreadList', threadList)
    if(!threadList.length) {
      console.log(html)
      // fs.writeFileSync(path.join(__dirname, '../../testData/search.html'), html, {
      //   encoding: 'utf-8'
      // })
    }
    return threadList
  })
}

// 本地调试
export function localSearch() {
  const html = fs.readFileSync(path.join(__dirname, '../../testData/search.html'), {
    encoding: 'utf8'
  })
  const $ = cheerio.load(html)
  let threadList: ThreadItem[] = []
  console.log($('.s_post'))
  $('.s_post').each((index, item) => {
    const titleNode = $(item).find('.p_title a')
    threadList.push({
      title: titleNode.text(),
      href: 'https://tieba.baidu.com' + titleNode.attr('href')
    })
  })
  console.log('searchThreadList', threadList)
  return threadList
}