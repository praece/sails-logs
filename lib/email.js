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
var nodemailer = require('nodemailer');

//
// ### function Console (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Console transport object responsible
// for persisting log messages and metadata to a terminal or TTY.
//
var Mail = exports.Mail = function (options) {
  Transport.call(this, options);
  options = options || {};

  if (!options.to || !options.from || (!options.service && !options.auth && !options.transport)) {
    throw new Error("Winston-email requires to, from, auth and a service or transport");
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
  this.transport    = options.transport   || false;
  this.service      = options.service     || 'gmail';
  this.subject      = options.subject     || 'App Error: ' + process.env.APP_NAME + ' - ' + process.env.ENVIRONMENT;
  this.auth         = options.auth;
  this.to           = options.to;
  this.from         = options.from;

  if (this.json) {
    this.stringify = options.stringify || function (obj) {
      return JSON.stringify(obj, null, 2);
    };
  }

  if (options.transport) {
    this.smtpTransport = options.transport;
  } else {
    this.smtpTransport = nodemailer.createTransport({
      service: options.service,
      auth: {
        user: options.auth.user,
        pass: options.auth.pass
      }
    });
  }
};

//
// Inherit from `winston.Transport`.
//
util.inherits(Mail, Transport);

//
// Expose the name of this Transport on the prototype
//
Mail.prototype.name = 'mail';

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
Mail.prototype.log = function (level, msg, meta, callback) {
  if (this.silent) {
    return callback(null, true);
  }

  var self = this,
      output;

  output = common.log({
    colorize:    this.colorize,
    json:        this.json,
    level:       level,
    message:     msg,
    meta:        meta,
    stringify:   this.stringify,
    timestamp:   this.timestamp,
    showLevel:   this.showLevel,
    prettyPrint: this.prettyPrint,
    raw:         this.raw,
    label:       this.label,
    logstash:    this.logstash,
    depth:       this.depth,
    formatter:   this.formatter,
    align:       this.align,
    humanReadableUnhandledException: this.humanReadableUnhandledException
  });

  this.smtpTransport.sendMail({
    from: this.from,
    to: this.to,
    subject: this.subject,
    text: output
  }, function function_name (err) {
    if (err) return callback(err);

    self.emit('logged');
    callback(null, true);
  });
};