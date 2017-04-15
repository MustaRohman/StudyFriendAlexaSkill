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
  return fetch(API_URL + 'launch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'UserId': req.data.session.user.userId
    }
  }).then((response) => {
    return response.text();
  }).then((text) => {
    res.say('Study Friend Launched! Check your Alexa mobile app for your code');
    res.card({
      type: "Simple",
      content: 'Use the code ' + text + ' to create your timetable on the web app!'
    });
    return res.send();
  }).catch(err => {
    res.say('Unable to launch');
    throw err;
  });
  res.say('Study Friend Launched!!');
});

app.pre = function(req, res, type) {
  console.log('Pre request here');
  if (typeof app.dictionary.subjects === 'undefined') {
    console.log('Fetching subjects data');
    return fetch(API_URL + 'subjects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'UserId': req.data.session.user.userId
      }
    }).then((response) => {
      return response.json();
    }).then((json) => {
      console.log(json);
      console.log('Fetched json');
      app.dictionary = {"subjects":json};
      console.log(app.dictionary);
    }).catch((err) => {
      console.log(err);
    });
  }
};

app.intent('GetAgenda',{
    "slots": { "date": "AMAZON.DATE" },
    'utterances': utterances.getAgenda,
  }, (req, res) => {
      console.log(req.data);
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

app.intent('GetExamStartDate', {
  utterances: utterances.getExamStartDate
}, (req, res) => {
  let url = API_URL + 'exam-start';
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'UserId': req.data.session.user.userId
    }
  }).then((response) => {
    return response.text();
  }).then((text) => {
      res.say('Your exams start on ' + text);
      res.card({
        type: "Simple",
        content: 'Your exams start on ' + text
      });
      return res.send();
  }).catch((err) => {
    res.say('Unable to get exam start date');
    throw err;
  });
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
  'utterances': utterances.addBreakDay,
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
