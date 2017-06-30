var urlencode = require('urlencode');
var requestify = require('requestify');
const lib = require('lib')({token: process.env.STDLIB_TOKEN});

/**
* @param {string} user The user id of the user that invoked this command (name is usable as well)
* @param {string} channel The channel id the command was executed in (name is usable as well)
* @param {string} text The text contents of the command
* @param {object} command The full Slack command object
* @param {string} botToken The bot token for the Slack bot you have activated
* @returns {object}
*/
module.exports = (user, channel, text = '', command = {}, botToken = null, callback) => {
  var encodedSearch = urlencode(text);

  requestify.get('https://api.scryfall.com/cards/search?q=' + encodedSearch)
    .then(function(response) {
      var body = response.body;
      var result = JSON.parse(body);
      var firstTen = result.data.slice(0,10).map(function(card) { return card.name; } );
      var formattedFirstTen = firstTen.join('\n');

      callback(null, {
        response_type: 'in_channel',
        text: `Found ${result.total_cards} cards matching ${text}.\n${formattedFirstTen}`
      });
    })
    .fail(function(response) {
      var code = response.getCode();
      var message = 'Something went wrong... oops.';
      if (code == 404) {
        message = `Found 0 cards matching ${text}`
      }
      callback(null, {
        response_type: 'in_channel',
        text: message
      });
    });
};
