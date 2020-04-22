function doPost(e) {

  var properties = PropertiesService.getScriptProperties().getProperties();
  var token = properties.VERIFICATION_TOKEN;

  if (token != e.parameter.token) {
    throw new Error("Invalid Token");
  }

  var text = e.parameter.text;

  if (e.parameter.user_name) {
    // 半角英数記号のみの場合
    if (text.match(/^[\x20-\x7e]+$/)) {
      text = "Message from " + e.parameter.user_name + ": " + text;
    }
    else {
      text = e.parameter.user_name + "さんからメッセージです。" + text;
    }
  }

  saveToFirebase(text);
  postSlackMessage(e.parameter.user_name, e.parameter.text);

  return ContentService.createTextOutput("Your message has been sent successfully: " + e.parameter.text);
}


function saveToFirebase(message) {

  var properties = PropertiesService.getScriptProperties().getProperties();
  var url = properties.DATABASE_URL;
  var path = properties.TARGET_PATH;

  var token = ScriptApp.getOAuthToken();
  var firebase = FirebaseApp.getDatabaseByUrl(url, token);

  firebase.setData(path, message);
}


function postSlackMessage(sender, message) {

  var properties = PropertiesService.getScriptProperties().getProperties();
  var url = properties.WEBHOOK_URL;

  var channel = "#random";
  var username = "Speech";
  var icon_emoji = ":speech_balloon:";

  var attachments = [{
    "author_name": sender ? sender : "",
    "text": message
  }]

  Slack.postMessage(url, channel, username, icon_emoji, "", attachments);
}


function auth() {
  saveToFirebase("authenticated");
}
