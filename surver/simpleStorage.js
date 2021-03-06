exports.simpleStorage = (function() {
  var url = require('url'),
    config = require('./config').config,
    redis = require('redis'),
    redisClient;
  
  function initRedis(cb) {
    redisClient = redis.createClient(config.redisPort, config.redisHost);
    redisClient.on("error", function (err) {
      console.log("error event - " + redisClient.host + ":" + redisClient.port + " - " + err);
    });
    redisClient.auth(config.redisPwd, function() {
       cb();
    });
  }
  function checkToken(userId, token, category, method, cb) {
    if(category=='public' && method=='GET') {
      console.log('public GET access ok');
      cb(true);
    } else {
      console.log('looking for "'+category+'" in key "token:'+userId+':'+token+'"');
      redisClient.get('token:'+userId+':'+token, function(err, categoriesStr) {
        var categories;
        try {
          categories = JSON.parse(categoriesStr);
        } catch(e) {
          console.log('5-0');
          cb(false);
          return;
        }
        console.log('For user "'+userId+'", token "'+token+'", wanting "'+category+'", found categories: '+JSON.stringify(categories));
        var i;
        for(i in categories) {
          console.log('considering '+categories[i]);
          if(categories[i] == category) {
            cb(true);
            return;
          }
        }
        console.log('sorry');
        cb(false);
      });
    }
  }
  function doReq(reqObj, cb) {//opens and closes redis
    initRedis(function(){
      checkToken(reqObj.userId, reqObj.token, reqObj.category, reqObj.method, function(result) {
        if(result) {
          if(reqObj.method=='GET') {
            console.log('it\'s a GET');
            redisClient.get('value:'+reqObj.userId+':'+reqObj.category+':'+reqObj.key, function(err, value) {
              console.log('redis says:');console.log(err);console.log(value);
              redisClient.quit();
              cb(200, value);
            });
          } else if(reqObj.method=='PUT') {
            console.log('it\'s a PUT');
            redisClient.set('value:'+reqObj.userId+':'+reqObj.category+':'+reqObj.key, reqObj.value, function(err, data) {
              console.log('redis says:');console.log(err);console.log(data);
              redisClient.quit();
              cb(200);
            });
          } else if(reqObj.method=='DELETE') {
            console.log('it\'s a DELETE');
            redisClient.del('value:'+reqObj.userId+':'+reqObj.category+':'+reqObj.key, function(err, data) {
              console.log('redis says:');console.log(err);console.log(data);
              redisClient.quit();
              cb(200);
            });
          }
        } else {
          redisClient.quit();
          cb(403);
        }
      });
    });
  }
  function serve(req, res) {
    var responseHeaders = {
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Authorization'
    };
    if(req.method=='OPTIONS') {
      res.writeHead(200, responseHeaders);
      res.end();
    } else {
      var reqObj={};
      try {
        var urlObj = url.parse(req.url);
        console.log(urlObj);
        console.log('interpreted as:');
        var pathNameParts = urlObj.pathname.split('/');
        if(!req.headers.authorization || req.headers.authorization.length < 'Bearer '.length) {
          req.headers.authorization = 'Bearer ';
        }
        reqObj = {
          method: req.method,
          token: req.headers.authorization.substring('Bearer '.length),
          userId: pathNameParts[1],
          category: pathNameParts[2],
          key: pathNameParts[3],
          value: ''
        };
        console.log(reqObj);
        req.on('data', function(chunk) {
          reqObj.value += chunk;
          console.log('DATA:'+chunk);
        });
        req.on('end', function() {
          console.log('END:');
          doReq(reqObj, function(code, data) {
            res.writeHead(code, responseHeaders);
            res.end(data);
          });
        });
      } catch(e) {
          res.writeHead(500, responseHeaders);
          res.end();
          console.log(e);
      }
    }
  }
  function addToken(userId, token, categories, cb) {//opens and closes redis
    initRedis(function(){
      console.log('created token "'+token+'" for user "'+userId+'", categories: '+JSON.stringify(categories));
      redisClient.set('token:'+userId+':'+token, JSON.stringify(categories), function(err, data) {
        redisClient.quit();
        cb();
      });
    });
  }
  function removeToken(userId, token, cb) {//opens and closes redis
    initRedis(function(){
      console.log('removed token "'+token+'" for user "'+userId+'", categories: '+JSON.stringify(categories));
      redisClient.del('token:'+userId+':'+token, function(err, data) {
        redisClient.quit();
        cb();
      });
    });
  }
  function addUser(userId, password, cb) {//opens and closes redis
    initRedis(function(){
      redisClient.set('user:'+userId, password, function(err, data) {
        redisClient.quit();
        cb();
      });
    });
  }
  function createToken(userId, password, token, categories, cb) {//opens and closes redis
    console.log(userId+' - '+password+' - '+token+' - '+JSON.stringify(categories));
    initRedis(function(){
      redisClient.get('user:'+userId, function(err, data) {
        console.log(data);
        if(data == password) {
          console.log('creating token "'+token+'" for user "'+userId+'", categories: '+JSON.stringify(categories));
          redisClient.set('token:'+userId+':'+token, JSON.stringify(categories), function(err, data) {
            redisClient.quit();
            cb(true);
          });
        } else {
          cb(false);
        }
      });
    });
  }

  return {
    serve: serve,
    addToken: addToken,
    removeToken: removeToken,
    addUser: addUser,
    createToken: createToken
  };
})();
