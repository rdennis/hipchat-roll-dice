var http = require('request');
var cors = require('cors');
var uuid = require('uuid');
var url = require('url');
var DiceRoller = require('../lib/dice-roller');

// This is the heart of your HipChat Connect add-on. For more information,
// take a look at https://developer.atlassian.com/hipchat/tutorials/getting-started-with-atlassian-connect-express-node-js
module.exports = function(app, addon) {
    var hipchat = require('../lib/hipchat')(addon);

    // simple healthcheck
    app.get('/healthcheck', function(req, res) {
        res.send('OK');
    });

    // Root route. This route will serve the `addon.json` unless a homepage URL is
    // specified in `addon.json`.
    app.get('/',
        function(req, res) {
            // Use content-type negotiation to choose the best way to respond
            res.format({
                // If the request content-type is text-html, it will decide which to serve up
                'text/html': function() {
                    var homepage = url.parse(addon.descriptor.links.homepage);
                    if (homepage.hostname === req.hostname && homepage.path === req.path) {
                        res.render('homepage', addon.descriptor);
                    } else {
                        res.redirect(addon.descriptor.links.homepage);
                    }
                },
                // This logic is here to make sure that the `addon.json` is always
                // served up when requested by the host
                'application/json': function() {
                    res.redirect('/atlassian-connect.json');
                }
            });
        }
    );

    app.post('/webhook',
        addon.authenticate(),
        function(req, res) {
            var message = req.body.item.message.message.replace('/roll', '');
            var result = roll(message);
            var resultMessage = result.message;
            var messageOpts = {
                options: {
                    notify: true,
                    color: (result.success ? 'gray' : 'red'),
                    format: 'text'
                }
            };

            hipchat.sendMessage(req.clientInfo, req.identity.roomId, resultMessage, messageOpts)
                .then(function(data) {
                    res.sendStatus(200);
                });
        }
    );

    function roll(message) {
        try {
            var roller = new DiceRoller();
            var results = roller.rollDice(message);

            var messageResult = 'rolled ' + (results.result.dice || '') + ' ' + (results.result.str || '');
            return {
                success: true,
                message: messageResult
            };
        } catch (e) {
            return {
                success: false,
                message: e
            };
        }
    }

    // Notify the room that the add-on was installed. To learn more about
    // Connect's install flow, check out:
    // https://developer.atlassian.com/hipchat/guide/installation-flow
    addon.on('installed', function(clientKey, clientInfo, req) {
        hipchat.sendMessage(clientInfo, req.body.roomId, 'The ' + addon.descriptor.name + ' add-on has been installed in this room');
    });

    // Clean up clients when uninstalled
    addon.on('uninstalled', function(id) {
        addon.settings.client.keys(id + ':*', function(err, rep) {
            rep.forEach(function(k) {
                addon.logger.info('Removing key:', k);
                addon.settings.client.del(k);
            });
        });
    });

};
