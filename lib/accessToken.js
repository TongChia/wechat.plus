/**
 * Created by tongchia on 14-4-23.
 */


var https = require('https');

/**
 * 请求 access_token
 * @param {String} appID
 * @param {String} secret
 * @param {Function} callback
 */
function request (appID,secret,callback) {
  var back='',url='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appID+'&secret='+secret;
  https.get(url,function(res){
    res.on('data', function (chunk) {
      back += chunk
    });
    res.on('end', function () {
      back = JSON.parse(back);
      if(back.access_token){
        console.log('got access token :'+back.access_token);
        return callback(back.access_token)
      }else{
        console.log('Can\'t get access token :');
        console.dir(back);
        return this
      }
    })
  }).on('error', function(e) {
    console.log('request access token error ：'+e)
  });
}

module.exports = request;