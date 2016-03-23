var Mail = require('./lib/email').Mail;
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
      var config = sails.config.log;

      if (config.email && (process.env.NODE_ENV === 'production' || config.email.sendDev)) {
        var config = _.assign({level: 'error', json: true, handleExceptions: true}, config.email)

        config.custom.add(Mail, config);
      }

      if (config.file) {
        config.custom.add(winston.transports.File, {
          level: 'error',
          handleExceptions: true,
          maxsize: 10*1024*1024,
          maxFiles: 4,
          tailable: true,
          filename: config.file
        });
      }
    }
  };
};
