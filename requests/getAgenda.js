const fetch = require('node-fetch');

const createAgendaResponse = (json) => {
  console.log(json);
  let returnString = 'You have ';
  if (json.length == 1) {
    returnString = returnString.concat('1 topic assigned for that period: ');
  } else if (json.length > 1) {
    returnString = returnString.concat(json.length + ' topics assigned for that period: ');
  } else {
    returnString = returnString.concat('No topics assigned for that period');
    return returnString;
  }
  json.forEach((item) => {
    returnString += item + ',';
  });
  console.log(returnString);
  return returnString;
};

module.exports = (url, req, res) => {
  console.log('Retrieving..');
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
    console.log(err);
    res.say('Unable to get topics for that date');
    res.card({
      type: "Simple",
      content: 'Unable to get topics for that date'
    });
    return res.send();
  });
};
