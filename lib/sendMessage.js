/**
 * Created by tongchia on 14-4-23.
 */

var https = require('https');

// TODO: 判断类型 进行格式化 media_id是动态引用的 （touser,msgtype,obj,access_token,callback）
var model=[];
model['text']={touser:'',msgtype:'text',text:{content:''}};
model['image']={touser:'',msgtype:'image',image:{media_id:''}};
model['voice']={touser:'',msgtype:'voice',voice:{media_id:''}};
model['video']={touser:'',msgtype:'video',video:{media_id:'',title:'',description:''}};
model['music']={touser:'',msgtype:'music',music:{title:'',description:'',musicurl:'',hqmusicurl:'',thumb_media_id:''}};
model['news']={touser:'',msgtype:'news',news:{articles:[{title:'',description:'',url:'',picurl:''}]}};

/**
 * 发送消息
 * @param {Object|String} msg
 * @param {String} accessToken
 * @param callback
 */
function sendMessage (msg,accessToken,callback) {
  var back='',opt={
    hostname:'api.weixin.qq.com',
    path:'/cgi-bin/message/custom/send?access_token='+accessToken,
    method:'POST'
  };
  if('string'!=typeof msg) msg=JSON.stringify(msg);
  var req = https.request(opt, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      back += chunk
    });
    res.on('end', function () {
      callback(back);
    })
  });
  req.on('error', function(e) {
    console.log('send message error:'+e);
  });
  req.write(msg);
  req.end()
}

module.exports = sendMessage;