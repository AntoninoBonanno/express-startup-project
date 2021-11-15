#!/bin/bash

# DATABASE_URL = mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}
first_split=(${DATABASE_URL//@/ })
second_split=(${first_split[1]//\// })

HOST_URI=${second_split[0]} # ${DB_HOST}:${DB_PORT}

# Wait until database is available, and migrate schemas
./scripts/wait-for-it.sh $HOST_URI -s -t 60 -- npx prisma migrate deploy && npx prisma generate

if [ ${NODE_ENV:-"development"} = "production" ]; then
  pm2-runtime app.js
else
  npm start
fi