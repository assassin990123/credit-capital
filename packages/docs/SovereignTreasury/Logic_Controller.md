---
order: 20
label: Sovereign Treasury Logic Controller
---

# The Logic Controller

The logic contract can be ugraded.
This serves as the router for all currency coming into The Protocol. Things like the NFT Revenue controller send tokens (that started out as fiat revenue) here, and from there, it's routed to either the treasury wallet, beneficiary wallets, pools of assets, etc. The logic controllers rules are, by nature, static, so the contract itself must be replaced if any routing rules need to be changed. This requires a minumum vote from wallets within The Protocol, and effectively replaces this component with an altered version of itself.