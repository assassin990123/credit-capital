---
order: 65
label: Stability Mechanisms
---

# Stability Mechanisms

Observing any DEX, on which CCUSD is pooled, there are oracles. They report to the CCUSD contract the current price, and this contract takes action when the price hits the upper or lower trigger bounds.
The oracle consists of a smart contract that periodically queries the read price functions in the smart contracts of DEXes on the Fantom network. Using this data, and the funds from the Sovereign Treasury, it sells off or buys up CCUSD if the price hits certain proportional trigger points above and below 1.00.  
