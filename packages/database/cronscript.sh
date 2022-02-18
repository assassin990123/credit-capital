#!/bin/bash

# make sure that no zombie node process
killall -SIGKILL node

declare -p | grep -Ev 'BASHOPTS|BASH_VERSINFO|EUID|PPID|SHELLOPTS|UID' > /app/.env 

/usr/bin/node /app
