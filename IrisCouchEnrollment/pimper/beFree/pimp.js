var pimper = (function() {
  var content = {};
  function httpPut(address, value, headers, attachment, contentType) {
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', address, false);
    if(headers) {
      xhr.setRequestHeader(headers);
    }
    if(value) {
      xhr.send(value);
    } else {
      send();
    }
  }
  function createAdminUser(hostToSquat, adminUsr, adminPwd, assertion) {
    httpPut('http://libredocs.org/squat', JSON.stringify({
      host: hostToSquat,
      usr: adminUsr,
      pwd: adminPwd,
      browserIdAssertion: assertion
    }));
  }
  function createDatabase(couchAddress, dbName) {
    httpPut(couchAddress+'/'+dbName, null);
  }
  function createDocument(couchAddress, dbName, docName, value) {
    httpPut(couchAddress+'/'+dbName+'/'+docName, value, true);
  }
  function uploadAttachment(couchAddress, dbName, docName, attachmentName, localFileName, contentType) {
    httpPut(couchAddress+'/'+dbName+'/'+docName+'/'+attachmentName, null, true, localFileName, contentType);
  }
  function pimp(couchAddress, adminUsr, adminPwd, assertion, proxy, cb) {
    var httpTemplate, putHost;
    adminProxy = proxy;
    httpTemplate = 'http://'+proxy+couchAddress+'/{category}/';
    putHost = 'http://'+adminUsr+':'+adminPwd+'@'+proxy+couchAddress;
    createAdminUser(couchAddress, adminUsr, adminPwd, assertion);
    createDatabase(putHost, 'cors');
    createDocument(putHost, 'cors', '_design/well-known', '{'+
      '\"_id\": \"_design/well-known\",'+
      '\"shows\": {'+
        '\"host-meta\":'+ 
          '\"function\(doc, req\) { return {'+
            ' \\"body\\": \\"'+
            '<?xml version=\\\\\\"1.0\\\\\\" encoding=\\\\\\"UTF-8\\\\\\"?>\\\\\\n'+
            '<XRD xmlns=\\\\\\"http://docs.oasis-open.org/ns/xri/xrd-1.0\\\\\\" xmlns:hm=\\\\\\"http://host-meta.net/xrd/1.0\\\\\\">\\\\\\n'+
            '  <hm:Host xmlns=\\\\\\"http://host-meta.net/xrd/1.0\\\\\\">'+couchAddress+'</hm:Host>\\\\\\n'+
            '  <Link rel=\\\\\\"lrdd\\\\\\" template=\\\\\\"http://'+couchAddress+'/cors/_design/well-known/_show/webfinger?q={uri}\\\\\\"></Link>\\\\\\n'+
            '</XRD>\\\\\\n\\",'+
            '\\"headers\\": {\\"Access-Control-Allow-Origin\\": \\"*\\", \\"Content-Type\\": \\"application/xml+xrd\\"}'+
          '};}\",'+
        '\"webfinger\":'+ 
          '\"function\(doc, req\) { return {'+
            ' \\"body\\": \\"'+
            '<?xml version=\\\\\\"1.0\\\\\\" encoding=\\\\\\"UTF-8\\\\\\"?>\\\\\\n'+
            '<XRD xmlns=\\\\\\"http://docs.oasis-open.org/ns/xri/xrd-1.0\\\\\\" xmlns:hm=\\\\\\"http://host-meta.net/xrd/1.0\\\\\\">\\\\\\n'+
            '  <hm:Host xmlns=\\\\\\"http://host-meta.net/xrd/1.0\\\\\\">'+couchAddress+'</hm:Host>\\\\\\n'+
            '  <Link \\\\\\n'+
            '    rel=\\\\\\"remoteStorage\\\\\\"\\\\\\n'+
            '    api=\\\\\\"CouchDB\\\\\\"\\\\\\n'+
            '    auth=\\\\\\"http://'+couchAddress+'/cors/auth/modal.html\\\\\\"\\\\\\n'+
            '    template=\\\\\\"'+httpTemplate+'\\\\\\"\\\\\\n'+
            '  ></Link>\\\\\\n'+
            '</XRD>\\\\\\n\\",'+
            '\\"headers\\": {\\"Access-Control-Allow-Origin\\": \\"*\\", \\"Content-Type\\": \\"application/xml+xrd\\"}'+
          '};}\",'+
        '\"vep\":'+
          '\" function\(doc, req\) { return { \\"body\\": \\"\(coming soon\)\\",'+
          ' \\"headers\\": {\\"Access-Control-Allow-Origin\\": \\"*\\"}'+
         '};}\"'+
         '}}');
    uploadAttachment(putHost, 'cors', 'auth', 'modal.html', 'files/modal.html', 'text/html');
    uploadAttachment(putHost, 'cors', 'base64', 'base64.js', 'files/base64.js', 'application/javascript');
    uploadAttachment(putHost, 'cors', 'sha1', 'sha1.js', 'files/sha1.js', 'application/javascript');
  }
  function provision(userName, firstName, lastName, assertion, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', '/provision', true);
    xhr.onreadystatechange= function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 201) {
          cb('ok');
        } else if(xhr.status == 409) {
          cb('taken');
        } else {
          cb(xhr.status);
        }
      }
    };
    var data = JSON.stringify({
      userName: userName,
      firstName: firstName,
      lastName: lastName,
      browserIdAudience: 'http://libredocs.org',
      browserIdAssertion: assertion
    });
    xhr.send(data);
  }
  function ping(userName, proxy, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://'+proxy+userName+'.iriscouch.com', true);
    xhr.onreadystatechange= function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          cb('ok');
        } else if(xhr.status == 404) {
          cb('no');
        } else {
          cb(xhr.status);
        }
      }
    };
    xhr.send();
  }

  return {
    pimp: pimp,
    ping: ping,
    provision: provision
  };
})();

var options;
if(window) {
  //we're in the browser
} else if(process && process.argv && process.argv.length >= 5 ) {
  options = process.argv.splice(2);
  pimper.pimp(options[0], options[1], options[2]);
} else if(process.argv) {
  console.log('use as: node pimp.js {user}@{domain} {password} {yourremotestorage.net/CouchDB/proxy/}');
  console.log('E.g.: node pimp.js me@michiel.iriscouch.com asdf yourremotestorage.net/CouchDB/proxy/');
}
