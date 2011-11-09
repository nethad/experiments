var controller= (function() {
  var updateView = function() {}
  function init(setUpdateViewCb) {
    updateView = setUpdateViewCb;
  }
  function setCallbacks(callbacks) {
    callbacks.onMsg=function(data) {
    }
    var origOnWelcome = callbacks.onWelcome;
    callbacks.onWelcome = function() {
      users.getContacts(function(user) {
        tabs.getTabs(user, function(tabs) {
          user.notif=tabs;//put all tabs under notif for now
          updateView(user.userAddress, user);
        });
      });
      origOnWelcome();
    };
    msg.setCallbacks(callbacks);
  }
  function setUserAddress(userAddress, secret) {
    msg.register(userAddress, secret);
  }
  function testSecret(secret) {
    msg.testSecret(secret);
  }
  //function addContact(userAddress) {
  //}
  //function borrow(contactId, amount, currency, description) {
  //}
  //function lend(contactId, amount, currency, description) {
  //}
  //function tabAction(contactId, tabId, action) {
  //}
  function getCharacters(cb) {
    users.getCharacters(cb);
  }
  return {
    getCharacters: getCharacters,
    init: init,
    setCallbacks: setCallbacks,
    setUserAddress: setUserAddress,
    testSecret: testSecret,
    //addContact: addContact,
    //borrow: borrow,
    //lend: lend,
    //tabAction: tabAction
  };
})();
