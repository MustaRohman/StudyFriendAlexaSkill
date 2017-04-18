const fetch = require('node-fetch');

module.exports = (url, date, req, res) => {
  console.log('Retrieving');
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'UserId': req.data.session.user.userId
    }
  }).then((response) => {
    return response.json();
  }).then((json) => {
    console.log(json);
    const period = json[0];
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
    console.log(err);
    res.say("Unable to add break day to the date " + date);
    res.card({
      type: "Simple",
      content: "Unable to add break day to date " + date
    });
    return res.send();
  });
};
