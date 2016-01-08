var Mail = require('./lib/email').Mail;
var _    = require('lodash');

module.exports = function (sails) {
  var loader     = require('sails-util-mvcsloader')(sails);

  // Load config from default directories
  loader.configure({
    config: __dirname + '/config' // Path to the config to load
  });

  return {
  	configure: function () {
      if (sails.config.log.email && process.env.NODE_ENV === 'production') {
        var config = _.assign({level: 'error', json: true}, sails.config.log.email)

        sails.config.log.custom.add(Mail, config);
      }
  	}
  };
};