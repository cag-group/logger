const chai = require('chai')
const expect = chai.expect
const logger = require('../lib/logger')

describe('Logger tests', () => {
  it('Test simple logging', () => {
    logger.debug('Debug logging')
    logger.info('Info logging')
    logger.warn('Warn logging')
    logger.error('Error logging')
    logger.info(`Foo`, 'Bar') // 'Foo Bar'
  })

  it('setLogLevel', () => {
    logger.setLogLevel('info')
    expect(logger.getLogLevelString()).to.equal('info')
  })

  it('Add ignored path', () => {
    expect(logger.ignoredPaths).to.deep.equal(['/', '/health','/version','/kpis'])
    logger.addIgnoredPath('/worker')
    expect(logger.ignoredPaths).to.deep.equal(['/', '/health','/version','/kpis','/worker'])
  })
})
