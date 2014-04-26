/**
 * Created by tongchia on 14-4-24.
 */
var child_process = require('child_process');
var http = require('http');
var fs = require('fs');
var Url = require('url');
var path = require('path');

var file = {};

function curlPost (file_path,url,callback) {
  child_process.exec('curl -F media=@'+file_path+' "'+url+'"', function (error, stdout, stderr) {
    if (stdout !== '') {
      stdout = JSON.parse(stdout);
      return callback(stdout);
    } else {
      console.log('upload error: ');
      console.log(error || '');
      console.log(stderr);
      return this
    }
  })
}

function nodePost (file_path,url,callback) {
  var filename=path.basename(file_path),
      typeObj= {
        '.jpeg':'image/jpeg',
        '.jpg':'image/jpeg',
        '.amr':'audio/amr',
        '.mp4':'video/mpeg4',
        '.mp3':'audio/mp3'
      },
      contentType=typeObj[path.extname(filename).toLowerCase()];
  url=Url.parse(url);
  function post (body) {
    var back='',
        head='--GorgeousBoundary\r\nContent-Disposition: form-data; name="media"; filename="'+filename+'"\r\nContent-Type: '+contentType+'\r\n\r\n',
        tail='\r\n--GorgeousBoundary--\r\n',
        headers={
          'content-length': head.length+body.length+tail.length,
          'content-type': 'multipart/form-data; boundary=GorgeousBoundary',
          'host': url.host,
          'accept': '*/*'
        },
        options={
          headers:headers,
          host:url.host,
          hostname:url.hostname,
          path:url.path,
          method:'POST'
        };
    var req = http.request(options, function (res) {
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
    req.write(head);
    req.write(body);
    req.write(tail);
    req.end();
  }
  fs.readFile(file_path, function (err, data) {
    if (err) throw err;
    else post(data);
  });
}

function curlGET (url,dir_path,callback) {
  child_process.exec('curl "'+url+'" -o '+dir_path, function (error, stdout, stderr) {
    if (stdout !== '') {
      return callback(stdout);
    } else {
      console.log('download error: ');
      console.log(error || '');
      console.log(stderr);
      return this
    }
  })
}

file.upload = function (file_path,url,tools,callback) {
  if(typeof tools=='function') {callback=tools;tools='curl'}
  if(tools=='curl'){
    return curlPost(file_path,url,callback)
  }else{
    return nodePost(file_path,url,callback)
  }
};

file.download = function (url,dir_path,callback) {
  return curlGET (url,dir_path,callback)
};

exports = module.exports = file;