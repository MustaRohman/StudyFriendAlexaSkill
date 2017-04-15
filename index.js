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
const breakDay = require('./requests/addBreakDay.js');
const task = require('./requests/getTaskAtTime.js');
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
      return breakDay(url, date, req, res);
  });

app.intent('GetTaskAtTime', {
  'slots': { "time": "AMAZON.TIME" },
  'utterances': utterances.getTaskAtTime,
}, (req, res) => {
  const time = req.slot("time");
  const date = moment().format('YYYY-MM-DD');
  const url = API_URL + 'task/' + date + '/' + time;
  return task(url, time, req, res);
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

module.exports = app;
