var assert = require('assert');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});

// 测试api
import {getPostList} from '../src/api/index'

describe('api', function() {
  test('返回帖子回复列表', async function() {
    const postList = await getPostList()
    console.log(postList)
    expect('a').toBe('a')
  })
})