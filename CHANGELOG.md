# Change Log

All notable changes to the "tieba" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- 在 treeview 中展示各个吧的帖子
- 点击帖子使用 webview 浏览帖子
  + 图片半透明处理
- 实现登录功能,自动获取关注的吧

### 需要优化的问题
- post获取接口有时返回缓慢,导致经常显示不出帖子

## [0.0.2] - 2020-11-3
### Added
- 现在能够显示帖子首页内容了,对图片作了半透明处理
- 能够显示帖子的评论内容

## [0.0.1] - 2020-10-27
### Added
- 实现在treeview中展示几个固定的吧的帖子
- 刷新指定吧的帖子
- 使用vue构建webview