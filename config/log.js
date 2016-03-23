/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#!/documentation/concepts/Logging
 */

var winston = require('winston');
var config  = require('winston/lib/winston/config');
var _       = require('lodash');

var customLogger = new winston.Logger({
  // exitOnError: false,
  rewriters: [function (level, msg, meta) {
    // If someone passes an error directly into meta nest it on the correct key.
    if (meta instanceof Error) meta = {error: meta};

    // Parse out the stack since arrays are not enumerable.
    if (meta.error && meta.error.stack) meta.stack = meta.error.stack.split('\n');

    return meta;
  }]
});

customLogger.add(winston.transports.Console, {
  level: 'silly',
  colorize: true,
  // handleExceptions: true,
  formatter: function (options) {
    var output = '';
    output += config.colorize(options.level, options.level + ': ');

    if (options.meta.error) {
      output += options.meta.error.stack;
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
});

module.exports.log = {

  /***************************************************************************
  *                                                                          *
  * Valid `level` configs: i.e. the minimum log level to capture with        *
  * sails.log.*()                                                            *
  *                                                                          *
  * The order of precedence for log levels from lowest to highest is:        *
  * silly, verbose, info, debug, warn, error                                 *
  *                                                                          *
  * You may also set the level to "silent" to suppress all logs.             *
  *                                                                          *
  ***************************************************************************/

  custom: customLogger,
  level: 'silly',
  inspect: false

};
