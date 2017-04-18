const fetch = require('node-fetch');

module.exports = (url, req, res) => {
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
}
