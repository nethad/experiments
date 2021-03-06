define(
  ['require', './lib/ajax.js', './lib/couch.js', './lib/dav.js', './lib/webfinger.js'], 
  function (require, ajax, couch, dav, webfinger) {
    var onError = function (code, msg) {
        console.log(msg);
      },
      getStorageInfo = function (userAddress, cb) {
        webfinger.getAttributes(
          userAddress, {
            allowHttpWebfinger: true,
            allowSingleOriginWebfinger: false,
            allowFakefinger: true
          }, 
          function (err, data) {
            cb(err, null);
          }, 
          function (attributes) {
            cb(0, attributes);
            var storageAddresses = {};
          }
        );
      }, 
      createOAuthAddress = function (storageInfo, categories, redirectUri) {
        var terms = [
          'redirect_uri='+encodeURIComponent(redirectUri),
          'scope='+encodeURIComponent(categories.join(',')),
          'response_type=token',
          'client_id='+encodeURIComponent(redirectUri)
        ];
        return storageInfo.auth + (storageInfo.auth.indexOf('?') === -1?'?':'&') + terms.join('&');
      },
      getDriver = function (api, cb) {
        require([api === 'CouchDB'?'./lib/couch.js':'./lib/dav.js'], cb);
      },
      onReadyStateChange = function() {},
      createClient = function (storageInfo, category, token) {
        var storageAddress = webfinger.resolveTemplate(storageInfo.template, category);
        return {
          get: function (key, cb) {
            getDriver(storageInfo.api, function (d) {
              d.get(storageAddress, token, key, cb);
            });
          },
          put: function (key, value, cb) {
            getDriver(storageInfo.api, function (d) {
              d.put(storageAddress, token, key, value, cb);
            });
          },
          'delete': function (key, cb) {
            getDriver(storageInfo.api, function (d) {
              d['delete'](storageAddress, token, key, cb);
            });
          },
          'sync': function(libPath, onreadystatechange) {
            onReadyStateChange = onreadystatechange;
            var syncFrame = document.createElement('iframe');
            syncFrame.setAttribute('style', 'border-style:none;width:1px;height:1px;');
            syncFrame.src= location.protocol+'//'+location.host+libPath+'/syncFrame.html'
              +'?api='+encodeURIComponent(storageInfo.api)
              +'&template='+encodeURIComponent(storageInfo.template)
              +'&category='+encodeURIComponent(category)
              +'&token='+encodeURIComponent(token);
            document.body.appendChild(syncFrame);
            window.addEventListener('message', function(event) {
              if((event.origin == location.protocol +'//'+ location.host) && (event.data.substring(0, 5) == 'sync:')) {
                onReadyStateChange((event.data == 'sync:ready'));
              }
            }, false);
          }
        };
      },
      receiveToken = function () {
        var params, kv;
        /**
          this needs more attention.
        **/
        if(location.hash.length > 0) { 
          params = location.hash.split('&');
          for(var i = 0, il = params.length; i < il; i++) {
            if(params[i].length && params[i][0] ==='#') {
              params[i] = params[i].substring(1);
            }
            kv = params[i].split('=');
            if(kv.length >= 2) {
              if(kv[0]==='access_token') {
                ///XXX: ok im guessing its a base64 string and you somehow adding an = sign to the end of it ok, why?
                var token = unescape(kv[1]);//unescaping is needed in chrome, otherwise you get %3D%3D at the end instead of ==
                for(var j = 2,jl = kv.length; i < jl; i++) {
                  token += '='+kv[i]; 
                }
                return token;
              }
            }
          }
        }
        return null;
      },
      onConnect = function() {},
      connect = function(userAddress, categories, libPath, cb) {
        onConnect = cb;
        window.open(libPath+'/openDialog.html'
          +'?userAddress='+encodeURIComponent(userAddress)
          +'&categories='+encodeURIComponent(JSON.stringify(categories))
          +'&libPath='+encodeURIComponent(libPath));
        window.addEventListener('message', function(event) {
          if(event.origin == location.protocol +'//'+ location.host) {
            var data = JSON.parse(event.data)
            onConnect(0, data.storageInfo, data.bearerToken);
          }
        }, false);
      };
  return {
    getStorageInfo     : getStorageInfo,
    createOAuthAddress : createOAuthAddress,
    createClient       : createClient,
    receiveToken       : receiveToken,
    connect            : connect
  };
});
