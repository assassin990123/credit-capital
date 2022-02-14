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
version: 3
services:
  database:
    build: .
    # or from image
    image: credit-capital/database
    port: 8000
    restart: 'unless-stopped'
    environment:
      SUPABASE_SERVICE_KEY: '*********'
      SUPABASE_SERVICE_URL: '*********'
      INFURA: '**************'
      BALANCERVAULT_NETWORK: 'kovan'
      BALANCERVAULT_POOL: 'CAPL/USDC'
```

## Deployment to a swarm

You can also deploy this as a stack to a swarm, change the service name `cc-database` as desired

```bash
docker stack deploy --compose-file docker-compose.yml cc-database
```

# API

After running the app, it will spawn a http server in port 8000 (default)

## Endpoints

- `/` - root
- `/health` - to be used for readiness/health check
- `/price` - returns an array of latest prices based on the last recorded price data in the database

  ```json
  // example response
  {
    "prices": [
      {
        "type": "USDC/CAPL",
        "value": 1.4392799999999857
      },
      {
        "type": "CAPL/USDC",
        "value": 0.6947918403646337
      }
    ]
  }
  ```
