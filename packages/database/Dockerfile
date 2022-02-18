FROM mhart/alpine-node:14 as build-stage

WORKDIR /app
COPY . /app/
RUN yarn && yarn build


FROM mhart/alpine-node:14
WORKDIR /app

COPY --from=build-stage /app/build/ /app
COPY --from=build-stage /app/node_modules /app/node_modules
COPY --from=build-stage crontab.txt /etc/cron.d/app-cron
COPY --from=build-stage cronscript.sh /cronscript.sh

RUN RUN apk add --no-cache --virtual .gyp python make g++ tini ca-certificates \
    && chmod 0644 /etc/cron.d/app-cron \
    && chmod a+x /cronscript.sh  \
    && /usr/bin/crontab /etc/cron.d/app-cron \
    && yarn install --frozen-lockfile --production=true

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["cron", "-f"]