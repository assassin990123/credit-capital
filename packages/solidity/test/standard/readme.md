# Standard Rewards System Tests
These tests are for the base system, in which any generic LP can be staked for a CAPL reward per block.

So far we are testing three functions, ``deposit`` , ``withdraw`` are functions that deal with the vault primarily and data storage. These tests deal heavily with vault integration, although the ``rewards`` contract is used to proxy some calls.

the ``rewards`` test is an attempt at an end to end test with the time given. The goal here was to get as close to a real world test as possible, and test the core functionality of claiming logic in the rewards system. Further testing here would include testing withdrawals and multiple pools, stakes, etc.