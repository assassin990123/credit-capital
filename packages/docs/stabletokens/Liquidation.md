---
order: 70
label: Liquidation of Loans
---

# Liquidation of Loans

This is also called revenue-redirecting on a loan. If the Loan-to-value ratio between current debt and the value of the real estate asset(s) backing the loan drop low enough to make the loan risky, a third party can interact with the dapp to initiate a "liquidation".
Through the use of an oracle capable of estimating value and independent third party audits, the platform will assign loans one of the following risk statusesaccording to its TLV ratio:

Safe - 60% LTV

Risky - revenue redirection - 85% LTV

Pending/Insolvent - liquidation - 95%+ LTV


![_figure 2_](/images/contract_diagram_f2.png)

There will be a list in the DApp, which allows users to sort through currently open loans, and select from a list. Doing this, they can push them into redirection or liquidation state, in exchange for fees, a reward, or, depending on the collateral type, a portion of the revenue coming from the collateral.
