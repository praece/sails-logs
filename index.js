var Mail = require('./lib/email').Mail;
var Loggly = require('./lib/loggly').Loggly;
var winston = require('winston');
var config  = require('winston/lib/winston/config');
var _    = require('lodash');
var morgan = require('morgan');

module.exports = function (sails) {
  var loader     = require('sails-util-mvcsloader')(sails);

  // Load config from default directories
  loader.configure({
    config: __dirname + '/config' // Path to the config to load
  });

  return {
    configure: function () {
      var logConfig = sails.config.log;
      var consoleConfig = _.assign({
        level: 'warn',
        colorize: true,
        formatter: function (options) {
          var output = '';
          output += config.colorize(options.level, options.level + ': ');

          if (options.meta.error) {
            output += _.join(options.meta.stack, '\n');
            delete options.meta.error;
            delete options.meta.stack;
          } else {
            output += options.message;
          }

          if (!_.isEmpty(options.meta)) {
            output += '\n';
            output += JSON.stringify(options.meta, null, 2);
          }

          return output;
        }
      }, logConfig.console);

      logConfig.custom.add(winston.transports.Console, consoleConfig);

      if (logConfig.email && (process.env.NODE_ENV === 'production' || logConfig.email.sendDev)) {
        var mailConfig = _.assign({level: 'error', json: true, handleExceptions: true}, logConfig.email)

        logConfig.custom.add(Mail, mailConfig);
      }

      if (logConfig.loggly) {
        logConfig.custom.add(Loggly, {
          level: 'info',
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

      if (logConfig.logRequests) {
        morgan.token('user', function getUser(req, res) {
          var user = req.user;

          if (!user) return;

          return `${user.firstName} ${user.lastName} [${req.user.id}]`;
        });

        sails.config.http.middleware.order.unshift('logRequest');
        const template = ':user - :method :url :status - :response-time ms - :user-agent';
        const stream = {
          write(message) {
            sails.log.info(message, { tags: ['request-log'] });
          }
        };

        sails.config.http.middleware.logRequest = morgan(template, { stream });
      }
    }
  };
};
