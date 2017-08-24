This module is a work in progress.

---

You can create a global logger by writing:
```
const logger = require(`logger`).global(loggerID)
```

This will create a logger instance with the given ID and override the `console` methods.
Subsequent calls to `require(`logger`).global` must be given the same loggerID, and they will
all return the same instance of the logger.

---

You can also create multiple logger by writing:
```
const logger1 = require(`logger`).local(id1)
const logger2 = require(`logger`).local(id2)
```

This will create two unique instances of the logger, the `console` methods will not be overwritten.

If you use  `local` in multiple places with the same loggerID, the universe fabric of the universe
will be torn apart... Or at least I think that will happen, I don't really know.
