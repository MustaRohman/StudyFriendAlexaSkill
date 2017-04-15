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
};
