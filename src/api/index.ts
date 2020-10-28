import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'

export function getThreadList(keyword: string = '高达模型'):Promise<ThreadItem[]> {
  
  return axios.get('https://tieba.baidu.com/f', {
    params: {
      'kw': keyword, // axios会进行url编码, 如果写入编码后的数据, 会被再次编码, 导致404, 此处直接写中文
      'ie': 'utf-8',
      'pn': '0', // 页数 50 的倍数, 0是第一页
      'pagelets': 'frs-list/pagelet/thread',
      "pagelets_stamp": '1602726575670'
    },
  }).then(res => {
    const html:string = res.data
    const re:RegExp = /Bigpipe.register\("frs-list\/pagelet\/thread_list", {"content":(".*"),"parent"/
    const str = JSON.parse(html.match(re)![1])
    const $ = cheerio.load(str)
    
    
    let result: Array<ThreadItem> = []
    $('.j_thread_list').each(function (index, item) {
      const title = $(item).find('a.j_th_tit')
      // console.log(index, title.text(), 'https://tieba.baidu.com' + title.attr('href'))
      result.push({
        title: title.text(),
        href: 'https://tieba.baidu.com' + title.attr('href')!,
        images: []
      })
      const images = $(item).find('.threadlist_media img')
      if(images.length) {
        images.each(function(imgIndex:number, item) {
          // console.log(`图${imgIndex + 1}`, $(item).attr('bpic'))
          result[index].images.push($(item).attr('bpic')!)
        })
      }
    })
    return result
  })
}

// 获取一个帖子的内容
export function getPostList() {
  return axios.get('https://tieba.baidu.com/p/7029367562', {
    params: {
      pn: 1, // 第一页: 1
      ajax: 1,
      t: 1603270535773
    }
  }).then(res => {
    const html = res.data
    const $ = cheerio.load(html)

    // 评论人非常复杂, 稍后处理
    interface commentItem {
      content: string, // 评论内容
      username: string, // 评论人 可能是null, 实际人名可能不是这个, 没有的时候是userlist中的nickname
      user_id: number, // 评论人是谁不重要, 知道id就好
    }

    interface PostItem {
      text: string,
      author: string,
      pid: string, // postid
      imageList: string[],
      commentList?: any[]
    }
   
    let postList: PostItem[] = []
    $('.l_post').each((index, item) => {
      // 去除广告
      if($(item).attr('ad-dom-img') === 'true') {
        return
      }
      let author = $(item).find('.d_name a').text()
      let text = $(item).find('.d_post_content').text().trim()
      let pid = $(item).attr('data-pid')!
      let imageList: string[] = []
      const images = $(item).find('.d_post_content img')
      if(images.length) {
        images.each((index, item) => {
          // console.log(`图${index+1}, ${$(item).attr('src')}`)
          imageList.push($(item).attr('src')!)
        })
      }
      postList.push({
        text,
        author,
        imageList,
        pid
      })
    })
    return postList
  })
}

// 获取一个帖子中的所有贴中评论
export function getCommentList() {
  return axios.get('https://tieba.baidu.com/p/totalComment', {
    params: {
      t: 1603354967850,
      tid: 7029367562,
      fid: 1363635,
      pn: 1,
      'see_lz': 0
    }
  }).then(res => {
    // console.log(res.data.data.comment_list)
    let commentList: any[] = res.data.data.comment_list
    return commentList
  })
}

console.log('测试api')
async function testTieba() {
  const postList = await getPostList()
  const commentList = await getCommentList()
  for(let [k, v] of Object.entries(commentList)) {
    let targetPost = postList.find(item => item.pid === k)
    targetPost!.commentList = v['comment_info']
  }
  console.log(postList)
}
testTieba()
