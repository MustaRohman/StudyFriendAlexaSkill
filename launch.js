const fetch = require('node-fetch');
const API_URL  = 'http://localhost:4567/';

module.exports = function (req, res) {
  return fetch(API_URL + 'launch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'UserId': req.data.session.user.userId
    }
  }).then((response) => {
    return response.text();
  }).then((text) => {
    res.say('Study Friend Launched! Check your Alexa mobile app for your login code');
    res.card({
      title: "StudyFriend Login",
      type: "Simple",
      content: 'Use the code ' + text + ' to create your timetable on the web app!'
    });
    return res.send();
  }).catch(err => {
    res.say('Unable to launch');
    throw err;
  });
  res.say('Study Friend Launched!!');
};
