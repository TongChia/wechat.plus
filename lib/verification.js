/**
 * Created by TongChia on 14-4-21.
 */

/**
 * 验证消息真实性
 * @param {Object} q
 * @param {String} token
 * @returns {boolean} 返回验证结果 true或false
 */
function verification (q,token){
  if(q.signature && q.timestamp && q.nonce){
    var tempArr=[token, q.timestamp, q.nonce],sha1=require('crypto').createHash('sha1');
    tempArr=tempArr.sort();
    for(var i in tempArr){
      sha1.update(tempArr[i]);
    }
    return q.signature==sha1.digest('hex')
  }else{
    return false;
  }
}
module.exports = verification;