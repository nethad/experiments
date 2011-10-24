
function initSyncStorage( onStatus ){
  var numConns = 0
  var remoteStorage = null
  var keys = {}
  var pendingPush = {}
  var error = false
  function cacheGet( key ){
    var obj = {}
    if( keys[key] ){
      try {
        obj = JSON.parse( sessionStorage.getItem('_syncStorage_'+ key ) )
        if( obj === null ){
          obj = {}
        }
      } catch(e) {//unparseable. remove.
        sessionStorage.removeItem('_syncStorage_'+ key )
      }
    }
    return obj
  }
  function cacheSet( key, obj ){
    if( obj === null ){//negative caching.
      obj = { value: null }
    }
    sessionStorage.setItem('_syncStorage_'+ key, JSON.stringify( obj ) )
  }
  function triggerStorageEvent( key, oldValue, newValue ){
    //var e = document.createEvent('StorageEvent')
    //e.initStorageEvent('storage', false, false, key, oldValue, newValue, window.location.href, window.syncStorage )
    //dispatchEvent(e)
  }
  var reportStatus = function( deltaConns ){
    var userAddress
    var syncStatus = 'unsynced'
    if( onStatus ){
      numConns += deltaConns
      if( remoteStorage ){
        userAddress = remoteStorage.getUserAddress()
      } else {
        userAddress = null
      }
      if( userAddress ){
        if(numConns) {
          syncStatus = 'syncing'
        } else {
          syncStatus = 'synced'
        }
      }
      onStatus( { userAddress: userAddress
                , sync: syncStatus
                } )
    }
  }
      
  var prefetch = function( keysArg ){
    for(var i=0; i<keysArg.length; i++ ){
      var key = keysArg[i]
      keys[key] = true
      var cachedObj = cacheGet( key )
      if(remoteStorage) {
        if( cachedObj.value == undefined ){
          reportStatus( +1 )
          remoteStorage.get( key, function( result ){
            if( result.success ){
              error = false
              cacheSet( key, result )
              triggerStorageEvent( key, false, result.value )
            } else {
              error = result.error
            }
            reportStatus( -1 )
          })
        } else {
          triggerStorageEvent( key, false, cachedObj )
        }
      }
    }
  }
  var writeThrough = function( key, oldObj, newObj ){
    //if(remoteStorage && online) {
    if(remoteStorage) {
      reportStatus( +1 )
      remoteStorage.set( key, newObj, function( result ){
        if( result.success ){
          error = false
          //the following is not required for current spec, but might be for future versions:
          if( result.rev ){
            var cacheObj = cacheGet( key )
            cacheObj._rev = result.rev
            cacheSet( key, cacheObj )
          }
        } else {
          error = result.error
          cacheSet( key, oldObj )
          triggerStorageEvent( key, newObj.value, oldObj.value )
        }
        reportStatus( -1 )
      })
    } else {
      pendingPush[key]=true
    }
  }
  function connectSyncStorage() {//this will only happen when a logged-in session exists in sessionStorage
    var sessionStr = sessionStorage.getItem("session")
    if(sessionStr) {
      var session = {}
      try {
        session = JSON.parse(sessionStr)
      } catch (e) {
        sessionStorage.removeItem("session")
      }
      if(session.storage) {
        window.syncStorage.pullFrom(session.storage)
        window.syncStorage.syncItems(["favSandwich"])
      }
    }
  }

  function registerHosted(session) {
    alert("We looked for your remote storage at "+session.userAddress+", but couldn't find it there. Don't be sad though! Because if you stop by in our chat room, we can set up a test user for you. [http://webchat.freenode.net/?channels=unhosted] Probably you can even keep "+session.userAddress+" as your user address");
  }

  function signIn() {
    navigator.id.getVerifiedEmail(function(assertion) {
      if(assertion) {
        if(undefined != window.config) {// a sessionService exists
          $.ajax({ type: 'POST'
            , url: config.sessionServiceUrl+'/init'
            , data: { browserIdAssertion: assertion, dataScope: 'sandwiches' }
            , dataType: "text"
            , success: function(sessionStr) {
              var session = JSON.parse(sessionStr)
              if(session.userAddress && session.storage && session.storage.davToken && session.cryptoPwdForRead) {//coming back
                sessionStorage.setItem('session', sessionStr)
                connectSyncStorage()
              } else {//if webfinger succeeds, oauth. if not, register:
                webfinger.getDavBaseUrl(session.userAddress, 0, 1, function() {
                  registerHosted(session)
                }, function(davUrl) {
                  session.storage =
                    { userAddress: session.userAddress
                    , davUrl: davUrl
                    , dataScope: config.dataScope
                    , storageType: 'http://unhosted.org/spec/dav/0.1'
                    }
                  session.dataScope = config.dataScope
                  session.isHosted = false
                  sessionStorage.setItem('session', JSON.stringify(session))
                  window.location = session.storage.davUrl
                    + "oauth2/auth"
                    + "?client_id="+encodeURIComponent(config.clientId)
                    + "&redirect_uri="+encodeURIComponent(window.location)
                    + "&scope="+encodeURIComponent(session.dataScope)
                    + "&response_type=token"
                    + "&user_address="+encodeURIComponent(session.userAddress)
                })
              }
            }
          })
        } else {//no session storage, so use BrowserId only to locate storage, not to log in.
          $.ajax(
            { type: 'POST'
            , url: 'https://browserid.org/verify'
            , data: 
              { assertion: assertion
              , audience: 'myfavouritesandwich.org'
              }
            , dataType: 'json'
            , success: function(data) {
                webfinger.getDavBaseUrl(data.email, 0, 1, function() {
                  //this apparently gets called even after success function was called
                  //alert('fail')
                }, function(davUrl) {
                  var session =
                    { userAddress: data.email
                    , storage:
                      { userAddress: data.email
                      , davUrl: davUrl
                      , dataScope: 'simpleplanner'
                      , storageType: 'http://unhosted.org/spec/dav/0.1'
                      }
                    }
                  session.isHosted = false
                  sessionStorage.setItem('session', JSON.stringify(session))
                  window.location = session.storage.davUrl
                    + "oauth2/auth"
                    + "?client_id="+encodeURIComponent('clientId')
                    + "&redirect_uri="+encodeURIComponent(window.location)
                    + "&scope="+encodeURIComponent(session.dataScope)
                    + "&response_type=token"
                    + "&user_address="+encodeURIComponent(session.userAddress)
                })
              }
            , error: function(data) {
                alert(data)
              }
            }
          )
        }
      }
    })
  }

  function register() {
    window.location = 'http://myfavouritesandwich.org/register.html'
  }

  function disconnect() {
    onStatus({sync:'offline', userAddress: remoteStorage.getUserAddress()})
  }
  function reconnect() {
    onStatus({sync:'synced', userAddress: remoteStorage.getUserAddress()})
  }
  function signOut() {
    sessionStorage.removeItem('session')
    sessionStorage.removeItem('browserid-asertion')
    onStatus({sync:'unsynced'})
  }
  var syncStorage =
    { error: null
    , length: keys.length
    , key: function( i ){
      return 'return keys[i]';//need to find array_keys() function in js
    }
    , getItem: function( key ){
      return cacheGet(key).value
    }
    , setItem: function( key, val ){
      keys[key] = true
      localObj = cacheGet(key)
      if( localObj.value == val ){
        return
      } else {
        //the following trick, putting the value into an object which may have
        //other fields present than just .value, may in the future be necessary
        //for maintaining CouchDb metadata:
        var newObj = localObj
        newObj.value = val
        cacheSet( key, newObj )
        writeThrough( key, localObj, newObj )
      }
    }
    , flushItems: function( keys ){
      for( var i=0; i<keys.length; i++ ){
        var key = keys[i]
        window.localStorage.removeItem('_syncStorage_'+ key )
      }
    }
    , pullFrom: function( params ){
      if( params.storageType == 'http://unhosted.org/spec/dav/0.1' ){
        remoteStorage = UnhostedDav_0_1( params )
        reportStatus( 0 )
      } else {
        syncStorage.error = 'unsupported remote storage type '+ remoteStorageType
      }
    }
    , syncItems: function(keys) {
      prefetch(keys)
    }
    , signIn: signIn
    , disconnect: disconnect
    , reconnect: reconnect
    , signOut: signOut
  }
  reportStatus(0)
  window.syncStorage = syncStorage
  connectSyncStorage()
}

$(document).ready(function() {
  document.getElementById('buttonGoesHere').innerHTML = 
     '<input type="submit" id="syncButton" onclick="syncButtonClick()" onmouseover="syncButtonMouseOver()" onmouseout="syncButtonMouseOut()">'
    +'<span id="status">status</span>'
    +'<input type="submit" id="flushButton" onclick="flushButtonClick()" value="remove local data">'
})

$(document).ready(function() {
  var tokenReceived = gup("access_token")
  if(tokenReceived) {
    document.location='#'
    var sessionStr = sessionStorage.getItem("session")
    var session
    if(sessionStr) {
      session = JSON.parse(sessionStr)
    } else {
      alert('fail')
    }
    session.storage.davToken = tokenReceived
    session.unsaved = true
    sessionStorage.setItem("session", JSON.stringify(session))
  }
//  addEventListener('storage', storage_event, false)
  initSyncStorage(onStatus)
  syncStorage.syncItems(itemsToSync)
//  show()
})

gup = function(paramName) {
  var regex = new RegExp("[\\?&#]"+paramName+"=([^&#]*)")
  var results = regex.exec(window.location.href)
  if(results) {
    return results[1]
  }
  return null
}

function onStatus( status ){
  if(status.sync == 'unsynced') {
    document.getElementById('syncButton').value = 'sync'
    document.getElementById('syncButton').syncStatus = status
    document.getElementById('status').innerHTML = 'with your remote storage'
    document.getElementById('flushButton').style.display = 'none'
   } else if(status.sync == 'working') {
    document.getElementById('syncButton').value = 'syncing'
    document.getElementById('syncButton').syncStatus = status
    document.getElementById('status').innerHTML = 'with '+status.userAddress
    document.getElementById('flushButton').style.display = 'none'
  } else if(status.sync == 'synced') {
    document.getElementById('syncButton').value = 'synced'
    document.getElementById('syncButton').syncStatus = status
    document.getElementById('status').innerHTML = 'with '+status.userAddress
    document.getElementById('flushButton').style.display = 'none'
  } else if(status.sync == 'offline') {
    document.getElementById('syncButton').value = 'reconnect'
    document.getElementById('syncButton').syncStatus = status
    document.getElementById('status').innerHTML = 'with '+status.userAddress+' or '
    document.getElementById('flushButton').style.display = 'inline'
  }
}
function syncButtonClick() {
  if(document.getElementById('syncButton').syncStatus.sync == 'synced') {
    syncStorage.disconnect()
  } else if(document.getElementById('syncButton').syncStatus.sync == 'unsynced') {
    syncStorage.signIn()
  } else if(document.getElementById('syncButton').syncStatus.sync == 'offline') {
    syncStorage.reconnect()
  }
}
function flushButtonClick() {
  syncStorage.signOut()
}
function syncButtonMouseOver() {
  if(document.getElementById('syncButton').syncStatus.sync == 'synced') {
    document.getElementById('syncButton').value = 'disconnect'
    document.getElementById('status').innerHTML = 'from '+document.getElementById('syncButton').syncStatus.userAddress
  }
}
function syncButtonMouseOut() {
  if(document.getElementById('syncButton').syncStatus.sync == 'synced') {
    document.getElementById('syncButton').value = 'synced'
    document.getElementById('status').innerHTML = 'with '+document.getElementById('syncButton').syncStatus.userAddress
  }
