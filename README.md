# cc-rewards-vault-contracts
rewards v2 &amp; vault contracts for the credit capital ecosystem

## Design
**Figure 1** shows a high level overview of the functionality associated with each contract. The goal here is to seperate the rewards logic, an evolving component of the system, and the definition of pools such that (hopefully) the vault contract does not need to be changed. You can think of the reward contract as the business layer and the vault contract as the persistance layer.

![design illustration](cc-rv-design.jpg "Overview of rewards v2")
