# Validations

The [express-validator](https://express-validator.github.io/docs/) was used to validate the input data to the API

## Development
All validations are inside the folder `src\validations` and can be created via the `validationMiddleware` support function. 

The `validationMiddleware` support function is located in `src\middlewares\validation-middleware.ts`,
accepts as input an array of [ValidationChain](https://express-validator.github.io/docs/validation-chain-api.html) and return a `ValidationMiddleware` type that can used in a route.

If the input is invalid throw a **BadRequestException** with input errors. (See [exceptions documentation](/docs/exceptions.md))

### Creation of a validation

You can use the `src\interfaces\crud-validation.ts` interfaces to create validations in a controlled way.

```
import validationMiddleware, {ValidationMiddleware} from "../middlewares/validation-middleware";
import {ICreateValidation} from "../interfaces/crud-validation";

...

// With CRUD Interface 
const MyValidation: ICreateValidation = {
    create: validationMiddleware([
        // Any ValidationChain
    ])
};
export default MyValidation;

...

// Custom
const myValidation: ValidationMiddleware = validationMiddleware([
    // Any ValidationChain
]);
export default myValidation;

```

### Usage

```
const router = express.Router();

// With CRUD Interface 
router.use('/your-route', MyValidation.create, anyController);

// Custom
router.use('/your-route', myValidation, anyController);

```
