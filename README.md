# Express Startup Project

Quick Start Project is a Node.js server based on the Express framework and MySQL database.  

In this project we define an elegant and intuitive project structure, able to separate the correct responsibilities between the files. 
Furthermore, the basic functionalities of an Express server are already implemented, to have a ready-to-use project, where the only concern is to implement the API.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C46QJ0M)

### Features

- [Express Framework](https://expressjs.com/) for the basis of the application
- Easy configuration environment via .env file
- APIs protection based on [Keycloak](https://www.keycloak.org/) IAM. (See [documentation](/docs/keycloak.md))
- [Prisma](https://www.prisma.io/) as database client ORM.   <sub><sup>(MySQL was used, but you can easily change database type)</sup></sub>
- Custom Exceptions and automatic error handling. (See [documentation](/docs/exceptions.md))
- Custom Logger based on [winston](https://github.com/winstonjs/winston#readme) and [morgan](https://github.com/expressjs/morgan#readme) libraries. (See [documentation](/docs/logger.md))
- Easily Validations based on [express-validator](https://express-validator.github.io/docs/) library. (See [documentation](/docs/validations.md))
- Secure Real time based on [Socket.io](https://socket.io/) library. (See [documentation](/docs/real-time.md))
- Easily release with [Docker](https://www.docker.com/). (See [documentation](/docs/docker-releases.md))

## Directory Structure
```
project
│   .env   
│   README.md
├── docker            # Files required for creating staging and production docker images
├── docs              # Documentation
├── logs              # Automatically generated, contains application logs divided into days
├── prisma            
│   │   schema.prisma # The schema definition of the Models
│   └── migrations    # Contains the migration files
├──src
│  │   app.ts
│  │   environment.ts
│  ├── controllers    # The controllers handles all the logic and sending responses with correct codes
│  ├── exceptions     # The custom exceptions
│  ├── helpers        # Helper functions / classes
│  ├── interfaces     # The custom interfaces
│  ├── middlewares    # The custom middlewares
│  ├── routes         # The API routes maps to the Controllers
│  ├── services       # The services contains the database queries and returning objects or throwing errors
│  └── validations    # Validations to validate data before being processed by controllers (used in routes)
└── storage           # Automatically generated, contains the uploaded files from users
```

## Development Instructions

1. Copy and rename `.env.example` file to `.env` and edit settings (See [Keycloak settings documentation](/docs/keycloak.md#keycloak-settings))
2. Run `npm install` command to install dependencies
3. Run `npx prisma migrate dev` command to initialize the database or `npx prisma generate` command if the database already exists
4. Run `npm start` or `npm run dev` command to run local server (it restarts each time the code is changed)

NOTE:
- You can run `npm run build` command to build dist server (you need add .env file manually inside /dist directory)
- You can run `npx prisma studio` command to open Prisma Studio in the browser (is a visual editor for the data in your database)
- import the file `Express Startup Project.postman_collection.json` to Postman to test the API

### TODO
- [ ] Make a version without Keycloak, use jwt

## Getting Involved

Want to help out? Found a bug? Missing a feature? Post an issue on our [issue tracker](https://github.com/AntoninoBonanno/express-startup-project/issues).

I welcome contributions no matter how small or big!
