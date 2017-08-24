# Logger for Node.js apps in GKE

Logs with formatted timestamps when logging on standard out when running locally.
When running in Google Cloud, timestamps are remove and json format is used

## Usage
Create a global logger:
```
const logger = require(`logger`).global(loggerID)
```

This will create a logger instance with the given ID and override the `console` methods.
Subsequent calls to `require(`logger`).global` must be given the same loggerID, and they will
all return the same instance of the logger.

Create multiple loggers:
```
const logger1 = require(`logger`).local(id1)
const logger2 = require(`logger`).local(id2)
```

This will create two unique instances of the logger, the `console` methods will not be overwritten.

If you use `local` in multiple places with the same loggerID, the universe fabric of the universe
will be torn apart... Or at least I think that will happen, I don't really know.
