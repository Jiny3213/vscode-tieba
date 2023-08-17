import axios from './axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as vscode from 'vscode';
import { saveText } from '../utils/test';

interface ThreadItem {
  title: string, // 帖子的标题
  href: string, // 帖子的链接
  images: Array<string> // 帖子的图
}

// 获取某个吧的帖子
export function getThreadList(keyword: string = '高达模型'):Promise<ThreadItem[]> {
  
  return axios.get('https://tieba.baidu.com/f', {
    params: {
      'kw': keyword, // axios会进行url编码, 如果写入编码后的数据, 会被再次编码, 导致404, 此处直接写中文
      'ie': 'utf-8',
      'pn': '0', // 页数 50 的倍数, 0是第一页
      'pagelets': 'frs-list/pagelet/thread',
      "pagelets_stamp": new Date().getTime() // 时间戳
    },
  }).then(res => {
    const html: string = res.data
    const re = /Bigpipe.register\("frs-list\/pagelet\/thread_list", {"content":(".*"),"parent"/
    const str = JSON.parse(html.match(re)![1])
    const $ = cheerio.load(str)

    let threadList: ThreadItem[] = []
    $('.j_thread_list').each(function (index, item) {
      const title = $(item).find('a.j_th_tit')
      threadList.push({
        title: title.text(),
        href: 'https://tieba.baidu.com' + title.attr('href')!,
        images: []
      })
      const images = $(item).find('.threadlist_media img')
      if(images.length) {
        images.each(function(imgIndex:number, item) {
          threadList[index].images.push($(item).attr('bpic')!)
        })
      }
    })
    return threadList
  })
}

export interface PostItem {
  text: string, // 文字内容
  author: string, // 作者
  pid: string, // postid, 用于对应评论
  imageList: string[], // 图片列表
  commentList?: any[] // 评论
}

// 获取一个帖子的内容
export function getPostList(url: string = 'https://tieba.baidu.com/p/7029367562', page: number = 1) {
  console.log('开始获取post')
  return axios.get(url, {
    params: {
      pn: page, // 第一页: 1
      ajax: 1,
      t: new Date().getTime()
    }
  }).then( async res => {
    console.log('post已返回')
    const html = res.data
    // saveText(`${new Date().getTime()}.html`, html)
    const $ = cheerio.load(html)
    if($('title').text() === '百度安全验证') {
      vscode.window.showErrorMessage('触发百度安全验证，请打开浏览器验证，并重新获取cookie')
      return { errMessage: '触发百度安全验证，请打开浏览器验证，并重新获取cookie' }
    }
    let postList: PostItem[] = []
    let forumId: string // 吧id
    let totalPost = 0
    let totalPage = 0
    const pageMatch = html.match(/(\d+)<\/span>回复贴，共.*?(\d+)/)
    if(pageMatch) {
      totalPost = Number(pageMatch[1])
      totalPage = Number(pageMatch[2])
    } else {
      console.error('找不到页码，无法分页')
    }
    $('.l_post').each((index, item) => {
      // 去除广告
      if($(item).attr('ad-dom-img') === 'true') {
        return
      }

      // 获取吧id, 用于获取评论
      if(!forumId) {
        forumId = JSON.parse($(item).attr('data-field')!).content.forum_id
      }

      let author = $(item).find('.d_name a').text()
      let text = $(item).find('.d_post_content').text().trim()
      let pid = $(item).attr('data-pid')!
      let imageList: string[] = []
      const images = $(item).find('.d_post_content img')
      if(images.length) {
        images.each((index, item) => {
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

    console.log('postlist 处理完毕, 开始获取comment')
    // https://tieba.baidu.com/p/8313773571?pid=147133552225&cid=0#147133552225(搜索时的url)
    const tid = url.match(/p\/(\d*)/)![1]
    const commentList = await getCommentList(tid, forumId!, page)
    // 把评论塞到postlist
    if(Object.keys(commentList).length) {
      for(let [k, v] of Object.entries(commentList)) {
        let targetPost = postList.find(item => item.pid === k)
        targetPost!.commentList = v['comment_info']
      }
    }
    return {
      postList,
      totalPost,
      totalPage
    }
  })
}

// 评论信息
interface CommentObj {
  [propName: number]: CommentItem
}
interface CommentItem {
  comment_num: number,
  comment_list_num: number,
  comment_info: CommentInfo[]
}
interface CommentInfo {
  content: string, // 评论内容
  user_id: number, // 评论人id
  username: string, // 后期塞进去的用户昵称
  [propName: string]: any // 其他内容
}
// 用户信息
interface UserObj {
  [propName: number]: UserItem
}
interface UserItem {
  user_name?: string,
  user_nickname?: string 
  nickname: string, // 这个是真正用于展示的用户名
  display_name: string,
  ala_info?: { // 位置信息
    show_name: string
  },
  user_id: number // 用户id
}
// 获取一个帖子中的所有贴中评论
export function getCommentList(tid: string, fid: string, page: number = 1): Promise<CommentObj> {
  return axios.get('https://tieba.baidu.com/p/totalComment', {
    params: {
      t: new Date().getTime(),
      tid: tid, // thread id
      fid: fid, // forum_id 论坛id 暂时只能在post列表中获取, 1363635
      pn: page,
      'see_lz': 0 // 只看楼主
    }
  }).then(res => {
    console.log('comment已返回')
    let commentList: CommentObj = res.data.data.comment_list
    let userList: UserObj = res.data.data.user_list
    console.log('commentList', commentList)
    for(let item of Object.values(commentList)) {
      (item as CommentItem).comment_info.forEach(commentInfo => {
        commentInfo.username = userList[commentInfo.user_id].nickname
        commentInfo.content = commentInfo.content.replace(/<a.*?>(.*?)<\/a>/, '<span>$1<span>') // 去除回复用户高亮
      })
    }
    console.log('comment处理完毕')
    return commentList
  })
}

export function getMyForum() {
  return axios.get('https://tieba.baidu.com').then(res => {
    const html = res.data
    const re = /<script>(?:(?!<\/script).)*spage\/widget\/AsideV2.*?(\[\[\{.*?\}\]\]).*?<\/script>/
    console.log(html.match(re)[1])
    // 获取关注的吧
    const forumList = JSON.parse(html.match(re)[1])
    console.log(forumList)
  })
}
// <script>((?!<\/script).)*spage/widget/AsideV2.*?</script> 匹配

// getMyForum()