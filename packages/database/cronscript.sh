#!/bin/bash

# make sure that no zombie node process
killall -SIGKILL node

/usr/bin/node /app
