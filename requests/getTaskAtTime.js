const fetch = require('node-fetch');
const moment = require('moment');

module.exports = (url, time, req, res) => {
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
    let string;
    const time = moment(json.dateTime.time.hour + ':' + json.dateTime.time.minute, ['h:m a', 'H:m'])
        .add(json.periodDuration, 'm');
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
    let string = "No tasks assigned for the time: " + time;
    res.say(string);
    res.card({
      type: "Simple",
      content: string
    });
    return res.send();
  });
}
