# Docker Releases

Two releases have been prepared (staging and production) containing "mysql: 5.7" and the application created via Dockerfile.

Inside the `docker` folder is the "docker-compose" file common for both releases; 
inside the `docker/staging` and `docker/production` folders are the release-specific "docker-compose" file and Dockerfile

We have chosen not to insert keycloak in the docker-compose file because it requires an [initial configuration](/docs/keycloak.md#keycloak-settings) 
and it is preferable to have the keycloak service active before starting the application

## Release instructions
You can use [docker-compose](https://docs.docker.com/compose/) to create release:

- **Staging release**
    1. Copy and rename `docker/.env.example` file to `docker/staging/.env` and edit settings
        - Set `APP_ENV` as `development`
    2. Go to `docker` directory and run command: 
       ```
       docker-compose --project-directory .\staging -f docker-compose.yml -f staging\docker-compose.staging.yml -p myapp-staging up -d
       ```
- **Production release**
    1. Copy and rename `docker/.env.example` file to `docker/production/.env` and edit settings
        - Set `APP_ENV` as `production`
    2. Go to `docker` directory and run command 
       ```
       docker-compose --project-directory .\production -f docker-compose.yml -f production\docker-compose.prod.yml -p myapp-prod up -d
       ```

NOTE release .env:
- Set `DB_USERNAME` not as "root"
- Set `DB_PASSWORD` not as empty

You can create docker context for publish on the remote machine (ssh)
- Run `docker context create CONTEXT_NAME --docker "host=ssh://USERNAME@HOST"` command
- Run `docker context use CONTEXT_NAME`
- Now you can use docker commands which will be executed on the remote machine
