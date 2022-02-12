# Credit Capital

The frontend can be found here: ``packages/app``
The backend can be found here ``packages/sol``

### Development
- first, bootstrap the repository

    ``yarn bootstrap``

- then, if you want to run the web app, first copy the contents of``.env.example`` file located in the ``app`` package into a new file called ``.env``, then

    ``yarn start``

The app will then be available at ``http://localhost:8080/``


## Smart contracts
- If you want to compile contracts, run

    ``yarn compile``

- If you want to run backend tests, run

    ``yarn test``

## Deployment
- first, replace the properties in the ``packages/sol/.env`` file with the proper values.

    ```
    CAPL_CAP=[CAPL CAP limit(probably 100000000000000000000000000)]
    LP_TOKEN_ADDRESS=[TreasuryShare token address(USDC-CAPL Token Pool)]
    PRIVATE_KEY=[Metamask PrivateKey]
    INFURA_ID=[Infura Project ID]
    ```

- then, deploy the smart contracts with
    ``yarn deploy-testnet``

- last, copy the contract addresses from the ``.config.js`` file located in the ``sol`` package into ``packages/app/src/constants``