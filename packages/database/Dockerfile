FROM mhart/alpine-node:14 as build-stage

WORKDIR /app
COPY . /app/
RUN yarn && yarn build


FROM mhart/alpine-node:14
WORKDIR /app

COPY --from=build-stage /app/build/ /app
COPY --from=build-stage /app/node_modules /app/node_modules

CMD ["node", "."]