FROM mhart/alpine-node:14 as build-stage

WORKDIR /app
COPY . /app/
RUN yarn && yarn build


FROM mhart/alpine-node:14
WORKDIR /app

COPY --from=build-stage /app/build/ /app
COPY --from=build-stage /app/node_modules /app/node_modules
COPY crontab.txt /crontab.txt
COPY cronscript.sh /app/cronscript.sh
RUN apk add --no-cache tini \
    && /usr/bin/crontab /crontab.txt \
    && chmod a+x /cronscript.sh \
    && declare -p | grep -Ev 'BASHOPTS|BASH_VERSINFO|EUID|PPID|SHELLOPTS|UID' > /container.env

ENTRYPOINT ["/sbin/tini", "--"]
CMD [ "/usr/sbin/crond", "-f", "-l", "8" ]