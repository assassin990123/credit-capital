# Token Controller Contract

This contract's function is to mint CAPL (MRC20) token. (see CAPL.sol)

The controller must have onwnership of the CAPL contract.

The controller must also have RBAC so that only specified contracts are allowed to call the ``mint`` function.
