const fetch = require('node-fetch');

module.exports = (url, req, res) => {
  console.log('Retrieving..');
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
    } else {
      res.say('You have ' + extraDays +' extra days available');
      res.card({
        type: "Simple",
        content: 'You have ' + extraDays +' extra days available'
      });
    }
    return res.send();
  }).catch((err) => {
    res.say('Unable to get extra days');
    throw err;
  });
};
