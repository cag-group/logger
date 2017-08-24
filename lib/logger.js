const winston = require('winston')
const moment = require('moment')
const gcpTransport = require('@google-cloud/logging-winston')

winston.add(gcpTransport)

const isCloud = process.env.NODE_ENV === 'stage' || process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'it'

class Logger {
  constructor() {
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    this.currentLogLevel = this.logLevels.debug
    this.LOGGER_ID = undefined
    this.isInitialized = false
    this.init = this.init.bind(this)
  }

  init(loggerID) {
    if (!this.isInitialized) {
      if (loggerID === undefined) {
        throw new Error('Logger must be given an loggerID')
      }
      this.isInitialized = true

      if (isCloud) {
        this.winstonLogger = winston.loggers.get(this.LOGGER_ID, {
          transports: [
            new winston.transports.Console({
              formatter: Logger.formatter
            })
          ]
        })
      } else {
        this.winstonLogger = winston.loggers.get(this.LOGGER_ID)
        this.winstonLogger.remove(winston.transports.Console)
        this.winstonLogger.add(winston.transports.Console, {
          timestamp: Logger.formatTimestamp
        })
      }

      this.winstonLogger.level = 'silly'
    }

    return this
  }

  static formatter(entry) {
    if (entry && entry.meta && typeof entry.meta === 'object' && Object.keys(entry.meta).length > 0) {
      const result = entry.meta
      result.severity = entry.level
      return JSON.stringify(result)
    }
    return JSON.stringify({
      severity: entry.level,
      message: entry.message
    })
  }

  static formatTimestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS')
  }

  getLogLevel() {
    return this.currentLogLevel
  }

  getLogLevelString() {
    for (let property in this.logLevels) {
      if (this.logLevels.hasOwnProperty(property)) {
        if (this.logLevels[property] === this.currentLogLevel) {
          return property
        }
      }
    }
    return this.currentLogLevel
  }

  setLogLevel(logLevel) {
    if (this.logLevels[logLevel] === undefined) {
      this.warn('Illegal logLevel', logLevel)
      throw new Error('Illegal logLevel ' + logLevel)
    }
    this.currentLogLevel = this.logLevels[logLevel]
  }

  error() {
    if (this.logLevels.error >= this.currentLogLevel) {
      if (this.winstonLogger !== undefined) {
        this.winstonLogger.error.apply(this, arguments)
      }
      return true
    }
    return false
  }

  warn() {
    if (this.logLevels.warn >= this.currentLogLevel) {
      if (this.winstonLogger !== undefined) {
        this.winstonLogger.warn.apply(this, arguments)
      }
      return true
    }
    return false
  }

  info() {
    if (this.logLevels.info >= this.currentLogLevel) {
      if (this.winstonLogger !== undefined) {
        this.winstonLogger.info.apply(this, arguments)
      }
      return true
    }
    return false
  }

  debug() {
    if (this.logLevels.debug >= this.currentLogLevel) {
      if (this.winstonLogger !== undefined) {
        this.winstonLogger.debug.apply(this, arguments)
      }
      return true
    }
    return false
  }
}

const logger = new Logger()

// Redirect calls to console.log etc.
console.log = function() {
  logger.debug.apply(logger, arguments)
}
console.info = function() {
  logger.info.apply(logger, arguments)
}
console.warn = function() {
  logger.warn.apply(logger, arguments)
}
console.error = function() {
  logger.error.apply(logger, arguments)
}

module.exports = logger.init