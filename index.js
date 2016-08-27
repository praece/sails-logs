var Mail = require('./lib/email').Mail;
var Loggly = require('./lib/loggly').Loggly;
var winston = require('winston');
var _    = require('lodash');

module.exports = function (sails) {
  var loader     = require('sails-util-mvcsloader')(sails);

  // Load config from default directories
  loader.configure({
    config: __dirname + '/config' // Path to the config to load
  });

  return {
    configure: function () {
      var logConfig = sails.config.log;

      if (logConfig.email && (process.env.NODE_ENV === 'production' || logConfig.email.sendDev)) {
        var config = _.assign({level: 'error', json: true, handleExceptions: true}, logConfig.email)

        logConfig.custom.add(Mail, config);
      }

      if (logConfig.loggly) {
        logConfig.custom.add(Loggly, {
          level: 'debug',
          token: logConfig.loggly.token,
          subdomain: 'praece',
          tags: logConfig.loggly.tags,
          json: true
        });
      }

      if (logConfig.file) {
        logConfig.custom.add(winston.transports.File, {
          level: 'error',
          handleExceptions: true,
          maxsize: 10*1024*1024,
          maxFiles: 4,
          tailable: true,
          filename: logConfig.file
        });
      }
    }
  };
};
