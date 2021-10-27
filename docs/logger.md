# Logger

- The [winston](https://www.npmjs.com/package/winston) library was used to log in quickly and easily.
- The [winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file) library was also used to delete log files periodically.
- The [morgan](https://www.npmjs.com/package/morgan) library was used to log the http requests.

There are 5 levels of logging: **debug, http, info, warn, error**, 
which are printed in the console in different colors and stored in files.

Two log directories are created, each log is divided by days. 
- `logs/errors/`: They only contain logs of type error
- `logs/all/`: They all contain log types

NOTE: 
- Logs older than 14 days are deleted
- In production only **error** and **warn** log will be saved.

## Development

The implementation of Logger is located in `src\helpers\logger.ts`.

The implementation of `morganMiddleware` is located in `src\middlewares\morgan-middleware.ts` and used in `src\app.ts`:
automatic log of http requests.

### Usage

```
import Logger from "../helpers/logger";

...

const data: string = ""; // Any string data

Logger.debug(data);
Logger.http(data);
Logger.info(data);
Logger.warn(data);
Logger.error(data);
```
