# Credit Capital

## Frontend docs

## development

You can run two variations to get started. If you are also working on the smart contracts, run this:

```
#main directory
yarn build && yarn serve
```

Otherwise,
```
#app directory
yarn && yarn serve
```

Check out the ``app`` repository. In there you will find scaffolding for our app.

The stack is ``vue3``, ``typescript``, ``vuex``, ``web3``, ``web3modal``, ``ethers`` and several wallet provider librarires.

### features

Multi wallet support - check out ``app/src/utils`` to understand ``web3modal`` and how it interacts with the store.

Testnet support - check out ``env.example``. In there, we can set the ``VUE_APP_NETWORK`` easily.



## Smart contract docs
Check out the documentation in the folders in ``contracts`` folder for documentation on each contract.

### Design illustration

**Figure 1** shows a high level overview of the functionality associated with the vault specifically. The goal here is to seperate the rewards logic, an evolving component of the system, and the definition of pools, users, and stakes such that (hopefully) the vault contract does not need to be changed. You can think of the reward contract as the business layer and the vault contract as the persistance layer.

![design illustration](assets/cc-design.png "Overview of Rewards V2")