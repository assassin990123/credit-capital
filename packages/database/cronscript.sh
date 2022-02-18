#!/bin/ash

# make sure that no zombie node process
killall -SIGKILL node

printenv > /app/.env

cat /app/.env

/usr/bin/node /app/index.js

