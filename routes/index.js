var url = require('url');
var DiceRoller = require('roll-dice');

var mentionMatcher = /\/@\/([^|\]]+)/g;
var verboseMatcher = /(^--?v(?:erbose)?)|(--?v(?:erbose)?$)/g;

var usageText = 'Usage:' +
  '\n  /roll d20' +
  '\n  /roll 2d8+2' +
  '\n  /roll d%' +
  '\n  /roll [ thing one | thing two | thing three ]';

// This is the heart of your HipChat Connect add-on. For more information,
// take a look at https://developer.atlassian.com/hipchat/tutorials/getting-started-with-atlassian-connect-express-node-js
module.exports = function (app, addon) {
  var hipchat = require('../lib/hipchat')(addon);

  // simple healthcheck
  app.get('/healthcheck', function (req, res) {
    res.send('OK');
  });

  // Root route. This route will serve the `addon.json` unless a homepage URL is
  // specified in `addon.json`.
  app.get('/',
    function (req, res) {
      // Use content-type negotiation to choose the best way to respond
      res.format({
        // If the request content-type is text-html, it will decide which to serve up
        'text/html': function () {
          var homepage = url.parse(addon.descriptor.links.homepage);
          if (homepage.hostname === req.hostname && homepage.path === req.path) {
            res.render('homepage', addon.descriptor);
          } else {
            res.redirect(addon.descriptor.links.homepage);
          }
        },
        // This logic is here to make sure that the `addon.json` is always
        // served up when requested by the host
        'application/json': function () {
          res.redirect('/atlassian-connect.json');
        }
      });
    }
  );

  // This is an example route to handle an incoming webhook
  // https://developer.atlassian.com/hipchat/guide/webhooks
  app.post('/roll',
    addon.authenticate(),
    function (req, res) {
      addon.logger.info('/roll');
      var message = req.body.item.message;
      var messageText = message.message.substring(6); // remove '/roll '
      var input = messageText.trim();
      var verbose = false;

      // replace /@/ with @ for mentions
      input = input.replace(mentionMatcher, '@$1');

      addon.logger.info('  message: "' + messageText + '"');
      addon.logger.info('  input:   "' + input + '"');

      var response = '';
      var options = {
        format: 'text'
      };

      // todo: improve the way we check for usage flags
      if (input.length < 1 || input === '-h' || input === '--help' || input === '--usage') {
        response += usageText;
      } else {
        if(verboseMatcher.test(input) !== null) {
          verbose = true;
          input = input.replace(verboseMatcher, '').trim();
        }

        var diceRoller = new DiceRoller();
        var result = diceRoller.roll(input);

        if (result instanceof DiceRoller.InvalidInputError) {
          response += '"' + result.input + '" is not a valid dice roll' +
            '\n' + usageText;
          options.color = 'red';
        } else {
          response += 'Rolled ' + result.result;

          if(verbose) {
            response += '\n  Result object: ' + JSON.stringify(result);
          }
        }
      }

      // note: options must be wrapped in an object, which seems weird...
      hipchat.sendMessage(req.clientInfo, req.identity.roomId, response, { options })
        .then(function (data) {
          res.sendStatus(200);
        });
    }
  );

  // Notify the room that the add-on was installed. To learn more about
  // Connect's install flow, check out:
  // https://developer.atlassian.com/hipchat/guide/installation-flow
  addon.on('installed', function (clientKey, clientInfo, req) {
    hipchat.sendMessage(clientInfo, req.body.roomId, 'The ' + addon.descriptor.name + ' add-on has been installed in this room');
  });

  // Clean up clients when uninstalled
  addon.on('uninstalled', function (id) {
    addon.settings.client.keys(id + ':*', function (err, rep) {
      rep.forEach(function (k) {
        addon.logger.info('Removing key:', k);
        addon.settings.client.del(k);
      });
    });
  });

};
