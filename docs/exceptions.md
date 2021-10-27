# Exceptions

The **synchronous exceptions** are handled by the `error-middleware` which log the exception and sends `IStatusMessage` type responses with the correct code.

For catch the **asynchronous exceptions** by the `error-middleware`, need wrap the async function with the [async-middleware](https://www.npmjs.com/package/async-middleware) library

NOTE: The [http-status-codes](https://www.npmjs.com/package/http-status-codes) library was used.

## Development

The implementation of `error-middleware` is located in `src\middlewares\error-middleware.ts`.

All available exceptions are located in `src\exceptions\http-exceptions.ts`.

### Usage

```
import {ForbiddenException} from "../exceptions/http-exceptions";
import {wrap} from "async-middleware";

...

// synchronous function
myFunction(req: Request, res: Response): void {
    if (anyCondition) {
        // handled by the `error-middleware`, sends `IStatusMessage` with 403 status
        throw new ForbiddenException(); 
    }
    
    await otherAsyncFunction().catch(error => {
        // handled by the `error-middleware`, sends `IStatusMessage` with 500 status
        // same of throw new Error(error.stack);
        // error.stack will only be saved in the internal log
        throw new InternalServerErrorException(error.stack);
    });
    
    res.send({});
}

// asynchronous function

wrap(async myFunction(req: Request, res: Response): Promise<void> {
    if (anyCondition) {
        // handled by the `error-middleware`, sends `IStatusMessage` with 400 status and errors
        throw new BadRequestException([{
            msg: "Invalid value",
            param: "param_name",
            location: "body",
            value: undefined
        }]);
    }
    
    res.send({});
})

```
