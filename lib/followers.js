/**
 * Created by tongchia on 14-4-28.
 */
var https = require('https');

var user = {};

function httpsGET (url,callback) {
  https.get(url,function(res){
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      getStr += chunk
    });
    res.on('end', function () {
      callback(JSON.parse(getStr))
    })
  }).on('error', function(e) {
    console.log('获取新关注者'+openid+'的信息时发生错误!'+e)
  });
}

user.info = function (token,openid,callback) {
  var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+token+'&openid='+openid+'&lang=zh_CN';
  return httpsGET(url,callback)
};

user.list = function (token) {
  var url = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token='+token+'&next_openid=';
  return httpsGET (url,callback)
};

exports = module.exports = user;