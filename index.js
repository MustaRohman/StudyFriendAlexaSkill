'use strict';
module.change_code = 1;
var Alexa = require('alexa-app');
var app = new Alexa.app('study-friend');
const moment = require('moment');
const fetch = require('node-fetch');
const utterances = require('./utterances.js');
const API_URL  = 'http://localhost:4567/';

app.launch(function(req, res) {
  console.log('Launching...');
  // get list of subjects from API_URL
  // add to dictionairy
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
    'utterances': utterances.getAgenda,
  }, (req, res) => {
      if (req.data.session.user.accessToken === undefined) {
        res.linkAccount();
        res.say('To start using this skill, please use the companion app to authenticate on Amazon');
        return res.send();
      }
      const date = req.slot("date");
      let url = API_URL + 'agenda/';
      url = createAgendaUrl(date, url);
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'UserId': req.data.session.user.userId
        }
      }).then((response) => {
        return response.json();
      }).then((json) => {
        const string = createAgendaResponse(json)
        res.say(string);
        res.card({
          type: "Simple",
          content: string
        });
        return res.send();
      }).catch(err => {
        res.say('Unable to get topics for that date');
        throw err;
      });
  });

app.intent('GetFreeDays', {
  utterances: utterances.getFreeDays
}, (req, res) => {
  let url = API_URL + 'free';
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'UserId': req.data.session.user.userId
    }
  }).then((response) => {
    return response.text();
  }).then((text) => {
    const extraDays = parseInt(text, 10);
    if (extraDays <= 0) {
      res.say('You have no extra days available');
      return res.send();
    } else {
      res.say('You have ' + extraDays +' extra days available');
      res.card({
        type: "Simple",
        content: 'You have ' + extraDays +' extra days available'
      });
      return res.send();
    }
  }).catch((err) => {
    res.say('Unable to get extra days');
    throw err;
  });
});

app.intent('GetRevisionProgress', {
  'utterances': utterances.getRevisionProgress,
}, (req, res) => {
  const date = moment().format('YYYY-MM-DD');
  let url = API_URL + 'progress/revision/' + date;
  console.log(url);
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'UserId': req.data.session.user.userId
    }
  }).then((response) => {
    return response.text();
  }).then((text) => {
    res.say('You are ' + text + ' percent through your revision timetable');
    res.card({
      type: "Simple",
      title: "Progress", // this is not required for type Simple
      content: "You are ' + text + ' percent through your revision timetable"
    });
    return res.send();
  }).catch((err) => {
    res.say('Unable revision progress info');
    throw err;
  });
});


const createAgendaUrl = (date, url) => {
  console.log(url);
  if ( date.indexOf('WE') > -1 ) {
    // Contains W
  } else if (date.indexOf('W') > -1) {
    url += 'week/';
  } else {
    url = url.concat('day/');
  }
  url = url.concat(date);
  return url;
};

const createAgendaResponse = (json) => {
  let returnString = 'You have ';
  if (json.length == 1) {
    returnString = returnString.concat('1 topic assigned for that date: ');
  } else if (json.length > 1) {
    returnString = returnString.concat(json.length + ' topics assigned for that date: ');
  } else {
    returnString = returnString.concat('No topics assigned for that date');
    return returnString;
  }
  json.forEach((item) => {
    returnString += item + ',';
  });
  return returnString;
}
module.exports = app;
