'use strict';
module.change_code = 1;
var Alexa = require('alexa-app');
var app = new Alexa.app('study-friend');
const moment = require('moment');
const fetch = require('node-fetch');
const launch = require('./launch.js');
const agenda = require('./requests/getAgenda.js');
const free = require('./requests/getFreeDays.js');
const progress = require('./requests/getRevisionProgress.js');
const examStart = require('./requests/getExamStartDate.js');
const utterances = require('./utterances.js');
const API_URL  = 'http://localhost:4567/';

app.launch(function(req, res) {
  console.log('Launching...');
  return launch(req, res);
});

app.intent('GetAgenda',{
    "slots": { "date": "AMAZON.DATE" },
    'utterances': utterances.getAgenda,
  }, (req, res) => {
      const date = req.slot("date");
      let url = API_URL + 'agenda/';
      url = createAgendaUrl(date, url);
      return agenda(url, req, res);
  });

app.intent('GetFreeDays', {
  utterances: utterances.getFreeDays
}, (req, res) => {
  let url = API_URL + 'free';
  return free(url, req, res);
});

app.intent('GetRevisionProgress', {
  'utterances': utterances.getRevisionProgress,
}, (req, res) => {
  const date = moment().format('YYYY-MM-DD');
  let url = API_URL + 'progress/revision/' + date;
  console.log(url);
  return progress(url, req, res);
});

app.intent('GetExamStartDate', {
  utterances: utterances.getExamStartDate
}, (req, res) => {
  let url = API_URL + 'exam-start';
  return examStart(url, req, res);
});

app.intent('AddBreakDay',{
    "slots": { "date": "AMAZON.DATE" },
    'utterances': utterances.addBreakDay,
  }, (req, res) => {
      const date = req.slot("date");
      if (date.includes("W")) {
        res.say("A break can only be added for a day. Please try again");
        return res.send();
      }
      let url = API_URL + 'break/' + date;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'UserId': req.data.session.user.userId
        }
      }).then((response) => {
        return response.json();
      }).then((json) => {
        const period = json[date][0];
        console.log(period.type);
        let string = '';
        if (period.type === 'BREAK_DAY') {
          string = "Break day added to date " + date;
        } else {
          string = "Unable to add break day"
        }
        res.say(string);
        res.card({
          type: "Simple",
          content: string
        });
        return res.send();
      }).catch(err => {
        res.say("Unable to add break day");
        res.card({
          type: "Simple",
          content: err
        });
        return res.send();
      });
  });

app.intent('GetTaskAtTime', {
  'slots': { "time": "AMAZON.TIME" },
  'utterances': utterances.getTaskAtTime,
}, (req, res) => {
  const time = req.slot("time");
  console.log(time);
  const date = moment().format('YYYY-MM-DD');
  console.log(date);
  const url = API_URL + 'task/' + date + '/' + time;
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'UserId': req.data.session.user.userId
    }
  }).then((response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  }).then((json) => {
    console.log(json);
    let string;
    const time = moment(json.dateTime.time.hour + ':' + json.dateTime.time.minute, ['h:m a', 'H:m'])
        .add(json.periodDuration, 'm');
    console.log(time);
    if (json.type === 'BREAK' || json.type === 'REWARD') {
      string = 'You currently have a break until ' + time.format('LT');
    } else {
      string = "You currently have revision of " + json.topicName + ' of subject ' + json.subjectName
        + ' until ' + time.format('LT');
    }
    res.say(string);
    res.card({
      type: "Simple",
      content: string
    });
    return res.send();
  }).catch((err) => {
    console.log(err);
    let string = "No tasks assigned for the time: " + time;
    res.say(string);
    res.card({
      type: "Simple",
      content: string
    });
    return res.send();
  });
});


const createAgendaUrl = (date, url) => {
  if ( date.indexOf('WE') > -1 ) {
    url += 'weekend/';
  } else if (date.indexOf('W') > -1) {
    url += 'week/';
  } else {
    url = url.concat('day/');
  }
  url = url.concat(date);
  console.log(url);
  return url;
};

const createAgendaResponse = (json) => {
  console.log(json);
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
