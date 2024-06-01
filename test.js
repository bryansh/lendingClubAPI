const lc = require('.')

lc.init({ apiKey: 'cuMvXIBhzQxXJDX9W7hFlhi8MWA=' })

/* lc.loans.listing(true, (err, data) => {
  console.log(err, data)
})
*/

// lc.accounts.availableCash(1069692, console.log)

// lc.accounts.funds.pending(1069692, console.log)

// lc.accounts.funds.add(1069692, 100, lc.accounts.funds.transferFrequency.LOAD_WEEKLY, '2021-01-05T00:00:00.000-0800', '2021-02-01T00:00:00.000-0800', '2021-01-14T00:00:00.000-0800', console.log)

// lc.accounts.createPortfolio(1069692, 1069692, "test Portfolio", "Test Portfolio description", console.log)

// add: function (investorId, amount, transferFrequency, startDate, endDate, estimatedFundsTransferStartDate, cb) {

// lc.accounts.funds.add(1069692, 100, lc.accounts.funds.transferFrequency.LOAD_WEEKLY, '2021-01-03', '2021-02-03', '2021-01-05', console.log)

// lc.accounts.filters(1069692, console.log)

lc.loans.listing(true, console.log)
