import morgan, {StreamOptions} from "morgan";
import Logger from "../helpers/logger";
import environment from "../environment";
import KeycloakHelper from "../helpers/keycloak-helper";

// Override the stream method by telling Morgan to use the custom logger instead of the console.log.
const stream: StreamOptions = {
    // Use the http severity
    write: (message) => Logger.http(message),
};

// Skip all the Morgan http log if the application is not running in development mode.
const skip = () => {
    return environment.isProduction();
};

// Define new morgan.token to show inside log
morgan.token('userInfo', req => {
    if (!req.headers.authorization) {
        return ' ';
    }

    const currentUser = KeycloakHelper.getCurrentUser(req);
    const userInfo = currentUser ? `{ username: ${currentUser.preferredUsername} - roles: ${currentUser.roles} }`
        : 'Invalid token or expired';
    return `- User info: ${userInfo}`;
});

// Build the morgan middleware
const morganMiddleware = morgan(
    ':response-time ms - [:status] :method :url :userInfo', // Define message format string
    {stream, skip} // Overwrote the stream and the skip logic.
);

export default morganMiddleware;
