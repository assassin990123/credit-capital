# Credit Capital

The frontend can be found here: ``packages/app``
The backend can be found here ``packages/sol``

### Development
- first, bootstrap the repository

``yarn bootstrap``

- then, if you want to run the web app, first copy the contents of``.env.example`` file located in the ``app`` package into a new file called ``.env``, then

``yarn start``

The app will then be available at ``http://localhost:8080/``



- If you want to compile contracts, run

``yarn compile``

- If you want to run backend tests, run

``yarn test``