const {Logging} = require('@google-cloud/logging')
const util = require('util')

const isCloud = process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== 'dev'

const logging = new Logging()

const metadata = {
  labels: {},
  resource: {type: 'global'}
}

/**
 * Logger for Node.js apps in for Stackdriver Logging in Google Cloud.
 *
 * Supports logging with levels:
 * debug, info, warn, error
 *
 * Redirects console.log to the logger.
 *
 * Logs json format in cloud.
 *
 * Supports a current log level.
 */
class Logger {
  constructor () {
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    this.ignoredPaths = ['/', '/health', '/version', '/kpis']
    this.currentLogLevel = this.logLevels.debug
  }

  init (logName) {
    if (isCloud) {
      this.cloudLog = logging.log(logName)

      // Redirect calls to console.log etc.
      console.log = function () {
        logger.debug.apply(logger, arguments)
      }
      console.info = function () {
        logger.info.apply(logger, arguments)
      }
      console.warn = function () {
        logger.warn.apply(logger, arguments)
      }
      console.error = function () {
        logger.error.apply(logger, arguments)
      }
    }
  }

  addLabel (name, value) {
    metadata.labels[name] = value
  }

  getRequestLogger () {
    const self = this
    return function (req, res, next) {
      const start = Date.now()
      res.on('finish', function () {
        const duration = Date.now() - start
        if (self.ignoredPaths.find(p => req.originalUrl === p) === undefined) {
          logger.debug(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl} ${JSON.stringify(res.statusCode)} ${duration} ms`)
        }
      })
      next()
    }
  }

  static formatTimestamp () {
    return new Date().toISOString().replace('T', ' ').replace('Z', '')
  }

  addIgnoredPath (path) {
    if (Array.isArray(path)) {
      this.ignoredPaths = [...this.ignoredPaths, ...path]
    } else {
      this.ignoredPaths.push(path)
    }
  }

  getLogLevel () {
    return this.currentLogLevel
  }

  getLogLevelString () {
    for (let property in this.logLevels) {
      if (this.logLevels.hasOwnProperty(property)) {
        if (this.logLevels[property] === this.currentLogLevel) {
          return property
        }
      }
    }
    return this.currentLogLevel
  }

  setLogLevel (logLevel) {
    if (this.logLevels[logLevel] === undefined) {
      this.warn('Illegal logLevel', logLevel)
      throw new Error('Illegal logLevel ' + logLevel)
    }
    this.currentLogLevel = this.logLevels[logLevel]
  }

  error () {
    return this._log(this.logLevels.error, arguments)
  }

  warn () {
    return this._log(this.logLevels.warn, arguments)
  }

  info () {
    return this._log(this.logLevels.info, arguments)
  }

  debug () {
    return this._log(this.logLevels.debug, arguments)
  }

  _log (logLevel, args) {
    if (logLevel >= this.currentLogLevel) {
      if (this.cloudLog === undefined) {
        console.log(Logger.formatTimestamp(), util.format.apply(util.format, args))
      } else {
        if (args.length > 0 && typeof(args[0]) === 'string') {
          this._callLogFunction(logLevel, this.cloudLog.entry(metadata, util.format.apply(util.format, args)))
        } else if (args.length > 0) {
          this._callLogFunction(logLevel, this.cloudLog.entry(metadata, args[0]))
        } else {
          this._callLogFunction(logLevel, this.cloudLog.entry(metadata))
        }
      }
      return true
    }
    return false
  }

  _callLogFunction (logLevel, args) {
    switch (logLevel) {
      case this.logLevels.debug:
        this.cloudLog.debug(args)
        break
      case this.logLevels.info:
        this.cloudLog.info(args)
        break
      case this.logLevels.warn:
        this.cloudLog.warning(args)
        break
      case this.logLevels.error:
        this.cloudLog.error(args)
        break
      default:
        this.cloudLog.info(args)
    }
  }
}

const logger = new Logger()

module.exports = logger
