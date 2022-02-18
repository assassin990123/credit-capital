## CreditCapital Database Backend

The Database backend exists to provide historic price data about the movement of CAPL. This service runs in order to pull up to date price data from the chain and store it in a centralized database. This data is then made available to the web3 DApp in order to accurately calculate daily/weekly/monthly price movements of CAPL as well as user's positions.

> ## TODO: Update Readme with proper documentation.

# Development

- Copy `.env.example` to `.env`
- Modify environment variables (e.g Infura url, etc)
- Install recommended extensions for vscode (optional)
- Install dependencies `yarn install`
- Start dev server `yarn start:dev`

# Running

## Command line

You need to build first the app before you can run it from the command line.

```
yarn build
```

Then run the app

```
yarn start
```

## Docker Container

You can also run the app via docker by building image from the provided Dockerfile

```
docker build . -t credit-capital/database
```

Then creating a container based on the built image

```
docker run -d --restart unless-stopped -p 8000:8000 --name cc-database -e INFURA=***** -e SUPABASE_SERVICE_KEY=******** credit-capital/database
--- or ---
docker run -d --restart unless-stopped --env-file .env --name cc-database credit-capital/database
```

## Docker Compose

You can also use this in docker-compose

```yaml
version: '3'
services:
  database:
    build: .
    # or from image
    image: credit-capital/database
    restart: 'unless-stopped'
    env_file: .env
```

## Deployment to a swarm

You can also deploy this as a stack to a swarm, change the service name `cc-database` as desired

```bash
docker stack deploy --compose-file docker-compose.yml cc-database
```

# Docker or Dockerfile.local?

You can use `Dockerfile.local` when you want to build the app outside docker, you can do this by running this command:

```
yarn build:local
```

This would build the app and build and run the docker

# Important Files

- `crontab.txt` contains the crontab definition, change this if you want to adjust the cron timer
- `cronscript.sh` contains the commands to run the node script, the app must run with this approach instead of directly running the node app via cron due to environment variables not being passed on by cron
- `docker-compose.yml` contains service definition for this, if you wan to deploy via docker-compose
- `Dockerfile` docker image definition file, contains a 2 stages that builds the app first, then creating a new image with the built app
- `Dockerfile.local` docker image definition file that assume that you build the app locally instead of using docker build stage
