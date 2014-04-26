/**
 * Created by tongchia on 14-4-22.
 */

var xml2js = require('xml2js');
var builder = new xml2js.Builder({rootName:'xml'});

/**
 * 整理数据为XML并发送
 * @param {Object|String|Array} data
 */
function formatReply (data) {
  var res = this, w=res.req.wechat;
  var xml,obj= {
    ToUserName : w.FromUserName,
    FromUserName : w.ToUserName,
    CreateTime : (new Date().getTime())/1000
  };
  switch (data.constructor) {
    case String:
      obj.MsgType = 'text';
      obj.Content = data;
      break;
    case Object:
      for(var i in data){
        obj[i]=data[i]
      }
      break;
    case Array:
      obj.MsgType = 'news';
      obj.ArticleCount = data.length;
      obj.Articles = {};
      obj.Articles.item = data;
      break;
    default :
      break
  }
  xml = builder.buildObject(obj);
  res.end(xml)
}
module.exports = formatReply;