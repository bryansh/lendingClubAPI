# node-lending-club-api
NodeJS implementation of the Lending Club API

# Prerequisites
You'll need to get a Lending Club API key from  
https://www.lendingclub.com/account/profile.action.

You'll also need to know your account number  (visible on your Account Summary page...big bold letters about "Available Cash").  Note: for simple scenarios, where one investor controls one account; I've found that account number serves as investorId.  Your mileage may vary.  
https://www.lendingclub.com/account/summary.action

#Installation and Initialization

````
npm install node-lending-club-api
````

Then in your Node APP

````
let lc = require('node-lending-club-api');

lc.init({ apiKey: '<insert your apikey here>' });
````

After that you are good to go!

### Available Exports

## Loan Listing

lc.loans.listing(showAll, cb)  
https://www.lendingclub.com/developers/listed-loans.action

## Summary
lc.accounts.summary(investorId, cb)  
https://www.lendingclub.com/developers/summary.action

## Available Cash
lc.accounts.availableCash(investorId, cb)  
https://www.lendingclub.com/developers/available-cash.action

## Add Funds
lc.accounts.funds.add(investorId, amount, transferFrequency, startDate, endDate, estimatedFundsTransferStartDate, cb)  
**note**: for the transfer frequency argument, the module does export an "enum":
````
lc.accounts.funds.transferFrequency.LOAD_NOW
lc.accounts.funds.transferFrequency.LOAD_ONCE
lc.accounts.funds.transferFrequency.LOAD_BIWEEKLY
lc.accounts.funds.transferFrequency.LOAD_ON_DAY_1_AND_16
lc.accounts.funds.transferFrequency.LOAD_MONTHLY
````
https://www.lendingclub.com/developers/add-funds.action

## Withdrawal Funds
lc.accounts.funds.withdrawal(investorId, amount, estimatedFundsTransferStartDate, cb)  
https://www.lendingclub.com/developers/add-funds.action

## Cancel Transfer
lc.accounts.funds.cancel(investorId, transferIds, cb)  
**Note: ** trasnferIds should be an array of transfer ids  
https://www.lendingclub.com/developers/cancel-transfers.action

## Notes Owned
lc.accounts.notes(investorId, cb)  
https://www.lendingclub.com/developers/notes-owned.action

## Detailed Notes Owned
lc.accounts.detailedNotes(investorId, cb)  
https://www.lendingclub.com/developers/detailed-notes-owned.action

## Portfolios Owned
lc.accounts.portfolios(investorId, cb)  
https://www.lendingclub.com/developers/portfolios-owned.action

## Create Portfolio
lc.accounts.createPortfolio(investorId, accountId, portfolioName, portfolioDescription, cb)  
https://www.lendingclub.com/developers/create-portfolio.action

## Submit Order
lc.accounts.submitOrder(investorId, orders, cb)  
**Note: ** To create objects for your orders array there is: lc.accounts.createOrderObject(loanId, requestedLoanAmount, portfolioId)  
https://www.lendingclub.com/developers/submit-order.action

The signature of the callback is function(err, res) where err passed from the request module; and res is the object returned from the lending club api itself (and defined in the referenced pages).

# Dependencies

* Request module


# TODO
* Lending Club does mention a rate limit of 1 request per second; this api respect this restriction.  While I've had no issues with collections of several calls.
