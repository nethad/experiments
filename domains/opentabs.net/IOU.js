function getImportantString() {
  var tabs = remoteStorage.getItem('tabs');
  var you = remoteStorage.getItem(you);

  var importantStr = '<ul>';
  for(i in tabs) {
    var iou = tabs[i];
    if((iou.proposer != you) && (iou.status == 'proposed') && (iou.payer == you)) {
      importantStr += '<li style="background-color:yellow">[incoming invoice:] [?]'+iou.payee+' '+iou.amount+iou.currency+'</li>';
    }
    if((iou.proposer != you) && (iou.status == 'proposed') && (iou.payee == you)) {
      importantStr += '<li style="background-color:yellow">[incoming IOU:] [?]'+iou.payer+' '+iou.amount+iou.currency+'</li>';
    }
    if((iou.proposer == you) && (iou.status == 'declined') && (iou.payer == you)) {
      importantStr += '<li style="background-color:yellow">[declined your IOU:] [X]'+iou.payee+' '+iou.amount+iou.currency+'</li>';
    }
    if((iou.proposer == you) && (iou.status == 'declined') && (iou.payee == you)) {
      importantStr += '<li style="background-color:yellow">[declined your invoice:] [X]'+iou.payer+' '+iou.amount+iou.currency+'</li>';
    }
  }
  importantStr += '</ul>';
  return importantStr;
}
function getContactsString() {
  var contacts = remoteStorage.getItem('contacts');
  var tabs = remoteStorage.getItem('tabs');
  var you = remoteStorage.getItem(you);
  var contactsStr = '<table id="contacts"></table>';
  for(var contact in contacts) {
    contactsStr += '<h2>'+contact+'</h2><ul>';

   for(i in tabs) {
       var iou = tabs[i];
      if((iou.payee == contact) && (iou.status == 'requested')) {
        contactsStr += '<li style="background-color:pink">[hurry:] [!]'+iou.amount+iou.currency+'</li>';
      }
      if((iou.payer == contact) && (iou.status == 'sent')) {
        contactsStr += '<li style="background-color:green">[got it?] [&#10003;]'+iou.amount+iou.currency+'</li>';
      }
      if((iou.payer == contact) && (iou.status == 'requested')) {
        contactStr += '<li style="background-color:green">[you said hurry] [!]'+iou.amount+iou.currency+'</li>';
      }
    }
    contactsStr += '</ul><hr><ul>';
    for(i in tabs) {
      var iou = tabs[i];
      if((iou.payee == contact) && (iou.status == 'accepted')) {
        contactsStr += '<li style="background-color:pink">[you owe them]'+iou.amount+iou.currency+'</li>';
      }
      if((iou.payer == contact) && (iou.status == 'accepted')) {
        contactsStr += '<li style="background-color:green">[they owe you]'+iou.amount+iou.currency+'</li>';
      }
      if((iou.payee == contact) && (iou.status == 'proposed')) {
        contactsStr += '<li style="background-color:pink">[you proposed] [?]'+iou.amount+iou.currency+'</li>';
      }
    }
    contactsStr += '</ul>';
  }
  return contactsStr;
}
function getHistoryString() {
  var tabs = remoteStorage.getItem('tabs');
  var you = remoteStorage.getItem(you);
  historyStr = '<h2>HISTORY</h2><ul>';
  for(i in tabs) {
    var iou = tabs[i];
    if((iou.proposer != you) && (iou.status == 'declined') && (iou.payee==you)) {
      historyStr += '<li style="background-color:yellow">[you declined] [X]'+iou.payer+' '+iou.amount+iou.currency+'</li>';
    }
    if((iou.proposer != you) && (iou.status == 'declined') && (iou.payer==you)) {
      historyStr += '<li style="background-color:yellow">[you declined] [X]'+iou.payee+' '+iou.amount+iou.currency+'</li>';
    }
    if((iou.payer == you) &&(iou.status == 'closed')) {
      historyStr += '<li style="background-color:yellow">[was declined] [X]'+iou.payee+' '+iou.amount+iou.currency+'</li>';
    }
    if((iou.payee == you) &&(iou.status == 'closed')) {
      historyStr += '<li style="background-color:yellow">[was declined] [X]'+iou.payer+' '+iou.amount+iou.currency+'</li>';
    }
    if((iou.payer == you) && (iou.status == 'sent')) {
      historyStr += '<li style="background-color:pink">[you sent] [&#10003;]'+iou.payee+' '+iou.amount+iou.currency+'</li>';
    }
    if((iou.payer == you) && (iou.status == 'received')) {
      historyStr += '<li style="background-color:pink">[they received] [&#10003;]'+iou.payee+' '+iou.amount+iou.currency+'</li>';
    }
    if((iou.payee == you) && (iou.status == 'received')) {
      historyStr += '<li style="background-color:green">[you received] [&#10003;]'+iou.payer+' '+iou.amount+iou.currency+'</li>';
    }
  }
  historyStr += '</ul>';
  return historyStr;
}
