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