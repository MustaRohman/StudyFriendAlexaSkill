'use strict';
module.change_code = 1;
var Alexa = require('alexa-app');
var app = new Alexa.app('study-friend');
const fetch = require('node-fetch');
const API_URL  = 'http://localhost:4567/';

app.launch(function(req, res) {
  console.log('Launching...');
  res.say('Study Friend Launched!!');
});

app.intent('TestIntent',{
    'utterances': ['test intent']
  }, function(req, res) {
    console.log(req.data.session.user.userId);
      if (req.data.session.user.accessToken) {
        res.say('Congratulations! Intent works');
      } else {
        res.linkAccount();
        res.say('To start using this skill, please use the companion app to authenticate on Amazon')
      }
  });

app.intent('GetAgenda',{
    "slots": { "date": "AMAZON.DATE" },
    'utterances': [
      "{get|give} {the|my} agenda for {-|date}",
      "what is my agenda like for {-|date}",
      "what topics do I need to study {|on} {-|date}"
    ]
  }, (req, res) => {
      console.log('Getting agenda...');
      const date = req.slot("date");
      let url = API_URL + 'agenda/';
      console.log(url);
      if ( date.indexOf('WE') > -1 ) {
        // Contains W
        console.log('Weekend');
      } else if (date.indexOf('W') > -1) {
        console.log('Week');
        url += 'week/';
      } else {
        console.log('Date');
        url = url.concat('day/');
        console.log(url);
      }
      return fetch(url + date, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'UserId': req.data.session.user.userId
        }
      }).then((response) => {
        return response.json();
      }).then((json) => {
        let returnString = 'You have ';
        if (json.length == 1) {
          returnString = returnString.concat('1 topic assigned for that date: ');
        } else if (json.length > 1) {
          returnString = returnString.concat(json.length + ' topics assigned for that date: ');
        } else {
          returnString = returnString.concat('no topics assigned for that date');
          res.say(returnString);
          return res.send();
        }

        json.forEach((item) => {
          returnString += item + ',';
        });

        console.log(returnString);
        res.say(returnString);
        return res.send();
      }).catch(err => {
        res.say('Unable to get topics for that date');
        throw err;
      });
  });
module.exports = app;
