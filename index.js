'use strict';
module.change_code = 1;
var Alexa = require('alexa-app');
var app = new Alexa.app('study-friend');

app.launch(function(req, res) {
  console.log('Launching...');
  res.say('Study Friend Launched!!');
});

app.intent('TestIntent',{
    'utterances': ['test intent']
  }, function(req, res) {
    console.log(req.data.session.user);
      if (req.data.session.user.accessToken) {
        res.say('Congratulations! Intent works');
      } else {
        res.linkAccount();
        res.say('To start using this skill, please use the companion app to authenticate on Amazon')
      }
  })
module.exports = app;
