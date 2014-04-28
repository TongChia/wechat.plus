/**
 * Created by TongChia on 14-4-27.
 */

var https = require('https');

var TOKEN='',DATA='',QR = {};

function request (data,callback) {
  var back='',headers = {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },options={
    host:'api.weixin.qq.com',
    hostname:'api.weixin.qq.com',
    path:'/cgi-bin/qrcode/create?access_token='+TOKEN,
    headers: headers,
    method:'POST'
  };
  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      back += chunk
    });
    res.on('end', function () {
      callback(typeof back=='string'?JSON.parse(back):back)
    })
  });
  req.on('error', function(e) {
    console.log('req error : '+e)
  });
  req.write(data);
  req.end();
}

/** @namespace r.ticket */

QR.limit = function (token,scene_id,callback) {
  TOKEN=token;
  DATA='{"action_name":"QR_LIMIT_SCENE","action_info":{"scene":{"scene_id":"'+scene_id+'"}}}';
  request(DATA,function(r){
    if(r.ticket){
      r._ticket=true;
      r.src='https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket='+r.ticket;
      return callback(r);
    }else{
      r._ticket=false;
      return callback(r);
    }
  })
};

QR.temp = function (token,expire,scene_id,callback) {
  TOKEN=token;
  DATA='{"expire_seconds":"'+expire+'","action_name":"QR_SCENE","action_info":{"scene":{"scene_id":"'+scene_id+'"}}}';
  request(DATA,function(r){
    if(r.ticket){
      r._ticket=true;
      r.src='https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket='+r.ticket;
      return callback(r);
    }else{
      r._ticket=false;
      return callback(r);
    }
  })
};

exports = module.exports = QR;