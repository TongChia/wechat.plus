/**
 * Created by tongchia on 14-4-21.
 */

var url = require('url');
var verify = require('./lib/verification');
var reply = require('./lib/formatReply');
var sendMessage = require('./lib/sendMessage');
var reqAcsToken = require('./lib/accessToken');
var toJson = require('xml2js').parseString;
var media = require('./lib/mediaFile');
var path = require('path');
var os = require('os');

var weChat = {settings:{}};

/**
 * @param {String} setting
 * @param {*} [val]
 */
weChat.set = function(setting, val){
  if (1 == arguments.length) {
    return this.settings[setting];
  } else {
    this.settings[setting] = val;
    return this;
  }
};

/**
 * weChat中间件 验证并解析xml消息 结果包含在 req.wechat 里
 * @returns {Function}
 */
weChat.parser = function (){
  var t = this.set('token');
  return function (req,res,next){
    var q=url.parse(req.url,true).query,data='';
    if(verify(q,t)){
      if('POST'==req.method){
        req.setEncoding('utf-8');
        req.on('data', function (chunk) {
          data += chunk;
        });
        req.on('end', function () {
          toJson(data, {explicitArray:false}, function (err, js) {
            if (!err) {
              req._wechat = true;
              req.wechat = js.xml;
              res.reply = reply;
              return next()
            }else{
              console.log(err);
              res.writeHead(500);
              res.end('xml error')
            }
          });
        });
      }else if('GET'==req.method && q.echostr){
        res.end(q.echostr)
      }else{
        res.writeHead(400);
        res.end('http method error')
      }
    }else{
      return next();
    }
  }
};

/**
 * 监听 type优先级为 [EventKey,Event,MsgType]
 * 官方值 [[自定义(VIEW,CLICK,SCAN)],[subscribe,unsubscribe,LOCATION],[text,image,voice,video,location,link]]
 * @param {String} type 监听的消息类型
 * @param {Function} callback
 * @returns {Function}
 */
weChat.on = function (type,callback) {
  return function (req,res,next){
    var w=req.wechat,t=w.EventKey || w.Event || w.MsgType;
    return type==t?callback(req,res,next):next();
  }
};

/**
 * 请求 access_token
 * @param {Function} callback Of course Function
 */
weChat.requestAccessToken = function (callback) {
  reqAcsToken(this.set('appID'),this.set('secret'),callback);
};

/**
 * 按时间请求并设置 access_token
 * @param {Number} timer
 */
weChat.setAccessTokenOnTime = function (timer) {
  function set_access_token (access_token) {
    weChat.set('access_token', access_token)
  }
  this.requestAccessToken(set_access_token);
  setInterval(function(){weChat.requestAccessToken(set_access_token)},timer||7150000);
};

/**
 * 发送客服消息
 * @param {Object|String} msg
 * @param {Function} callback
 */
weChat.send = function (msg,callback) {
  return sendMessage(msg,this.set('access_token'),callback)
};

/**
 * 上传媒体文件
 * @param {String} file_path
 * @param {Function} callback
 * @param {String} [media_type]
 */
weChat.upload = function (file_path,media_type,callback) {
  // TODO: 支持URL远程文件 (CouchDB是通过URL直接获取文件的)
  // TODO: 检测路径兼容性 (比如Win下相对路径会不会出问题)
  var tool='Windows_NT'==os.type()?'node':'curl',cb=typeof media_type=='function'?media_type:callback,
      typeObj={'.jpeg':'image','.jpg':'image','.amr':'audio','.mp4':'video','.mp3':'audio'},
      type=typeof media_type=='string'?media_type:typeObj[path.extname(file_path).toLowerCase()],
      url='http://file.api.weixin.qq.com/cgi-bin/media/upload?access_token='+this.set('access_token')+'&type='+type;
  return media.upload(file_path,url,tool,cb)
};

/**
 * 根据media_id下载媒体文件
 * @param {String} media_id
 * @param {String} dir_path
 * @param {Function} callback
 */
weChat.download = function (media_id,dir_path,callback) {
  var url='http://file.api.weixin.qq.com/cgi-bin/media/get?access_token='+this.set('access_token')+'&media_id='+media_id;
  return media.download(url,dir_path,callback)
};

// TODO: 利用 Canvas 压缩上传的图片
// TODO: 高级群发
// TODO: 自定义菜单

exports = module.exports = weChat;