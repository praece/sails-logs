/*
 * console.js: Transport for outputting to the console
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */
var winston    = require('winston');
var common     = require('winston/lib/winston/common');
var Transport  = require('winston/lib/winston/transports/transport').Transport;
var events     = require('events');
var os         = require('os');
var util       = require('util');
var loggly     = require('loggly');
var _          = require('lodash');

//
// ### function Console (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Console transport object responsible
// for persisting log messages and metadata to a terminal or TTY.
//
var Loggly = exports.Loggly = function (options) {
  Transport.call(this, options);
  options = options || {};

  if (!options.token || !options.subdomain) {
    throw new Error("Winston-loggly requires a token and subdomain");
  }

  this.json         = options.json        || false;
  this.colorize     = options.colorize    || false;
  this.prettyPrint  = options.prettyPrint || false;
  this.timestamp    = typeof options.timestamp !== 'undefined' ? options.timestamp : false;
  this.showLevel    = options.showLevel === undefined ? true : options.showLevel;
  this.label        = options.label       || null;
  this.logstash     = options.logstash    || false;
  this.depth        = options.depth       || null;
  this.align        = options.align       || false;
  this.eol          = options.eol         || os.EOL;


  if (this.json) {
    this.stringify = options.stringify || function (obj) {
      return JSON.stringify(obj, null, 2);
    };
  }

  this.client = loggly.createClient({
    token: options.token,
    subdomain: options.subdomain,
    tags: options.tags || [],
    json: this.json
  });
};

//
// Inherit from `winston.Transport`.
//
util.inherits(Loggly, Transport);

//
// Expose the name of this Transport on the prototype
//
Loggly.prototype.name = 'loggly';

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
Loggly.prototype.log = function (level, msg, meta, callback) {
  if (this.silent) {
    return callback(null, true);
  }

  var metaData = meta.meta || {};
  var tags = _.concat([], _.clone(meta.tags)) || [];
  tags.push(level);
  delete meta.tags;

  if (meta.error) {
    metaData.message = msg || (meta.error && meta.error.message) || 'No Message';
    metaData.stack = meta.error.stack || null;

    delete meta.error
  }

  metaData.message = _.trim(metaData.message || msg, '\n');
  metaData.data = JSON.stringify(meta);

  this.client.log(metaData, _.compact(tags));
};