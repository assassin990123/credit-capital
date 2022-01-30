# Credit Capital

The frontend can be found here: ``packages/app``
The backend can be found here ``packages/solidity``

### Development
first, bootstrap the repository

``yarn bootstrap``

then, if you want to run the web app, run

``yarn start``


If you want to compile contracts, run

``yarn compile``

If you want to run backend tests, run

``yarn test``

### Design illustration

**Figure 1** shows a high level overview of the functionality associated with the vault specifically. The goal here is to seperate the rewards logic, an evolving component of the system, and the definition of pools, users, and stakes such that (hopefully) the vault contract does not need to be changed. You can think of the reward contract as the business layer and the vault contract as the persistance layer.

![design illustration](assets/cc-design.png "Overview of Rewards V2")