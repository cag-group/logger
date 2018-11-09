## Node.js library for Google Cloud Logging

Output logs on standard output when running locally and to Stackdriver logging when deployed in GCP.

Supports settings log levels in runtime.

When deployed in cloud, logs appear in GCP console below "Global". Labels could be added in order to further
support log filtering.

HTTP requests are logged with debug. The following requests muted by default: /, /health, /version, /kpis.
Other URLs can be added by calling `addIgnoredPaths`.

The default log level is `info`.

Calls to `console.log` are redirected to the logger.

### Usage

```
const logger = require('@cag-group/logger')

// Initialize logging before using it. Logs appears in the
logger.init(`${config.appName}-${config.envName}`)

// Set labels
logger.addLabel('appName', config.appName)
logger.addLabel('envName', config.envName)
logger.addLabel('version', process.env.VERSION)

logger.addIgnoredPath('/noisyendpoint')

logger.setLogLevel('debug')

logger.error('logger error')
logger.warn('logger warn')
logger.info('logger info, %d', 42)
logger.info('The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog')
logger.debug('logger debug')
logger.debug('The Answer is %s, really.', 42)
logger.debug({foo: 'Text', bar: 42})        // Display in stackdriver logging: "{foo: 'Text', bar: 42}"
logger.debug({message: 'Text', value: 42})  // Display in stackdriver logging: "Text"
console.log('Console.log is', 'working' ' and outputs to the same destination')
```
