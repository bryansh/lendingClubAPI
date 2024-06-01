const fetch = require('node-fetch')
const { Headers } = require('node-fetch')

const api = {
  version: 'v1',
  init: function (options) {
    this.apiKey = options.apiKey
  }
}

api.accounts = {
  accountsUrl: 'https://api.lendingclub.com/api/investor/' + api.version + '/accounts/',
  portfoliosUrl: function (investorId) {
    return api.accounts.accountsUrl + investorId + '/portfolios'
  },
  filtersUrl: function (investorId) {
    return api.accounts.accountsUrl + investorId + '/filters'
  },
  // gets
  summary: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(api.accounts.accountsUrl + investorId + '/summary', PrepGetRequestOptions(), cb)
  },
  availableCash: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(api.accounts.accountsUrl + investorId + '/availablecash', PrepGetRequestOptions(), cb)
  },
  funds: {
    fundsUrl: function (investorId) {
      return api.accounts.accountsUrl + investorId + '/funds'
    },
    pending: function (investorId, cb) {
      SanitizeState(investorId)
      MakeRequest(this.fundsUrl(investorId) + '/pending', PrepGetRequestOptions(), cb)
    },
    transferFrequency: {
      LOAD_NOW: 'LOAD_NOW',
      LOAD_ONCE: 'LOAD_ONCE',
      LOAD_WEEKLY: 'LOAD_WEEKLY',
      LOAD_BIWEEKLY: 'LOAD_BIWEEKLY',
      LOAD_ON_DAY_1_AND_16: 'LOAD_ON_DAY_1_AND_16',
      LOAD_MONTHLY: 'LOAD_MONTHLY'
    },
    // TODO
    add: function (investorId, amount, transferFrequency, startDate, endDate, estimatedFundsTransferStartDate, cb) {
      SanitizeState(investorId, amount, estimatedFundsTransferStartDate)
      MakeRequest(this.fundsUrl(investorId) + '/add', PrepPostRequestOptions({
        transferFrequency: transferFrequency,
        amount: amount,
        startDate: startDate,
        endDate: endDate,
        estimatedFundsTransferStartDate: estimatedFundsTransferStartDate
      }), cb)
    },
    // TODO
    withdraw: function (investorId, amount, estimatedFundsTransferStartDate, cb) {
      SanitizeState(investorId, amount, estimatedFundsTransferStartDate)
      MakeRequest(PrepPostRequestOptions(this.fundsUrl(investorId) + '/withdraw', {
        amount: amount,
        estimatedFundsTransferStartDate: estimatedFundsTransferStartDate
      }), cb)
    },
    // TOdO
    cancel: function (investorId, transferIds, cb) {
      SanitizeState(investorId, transferIds)
      MakeRequest(PrepPostRequestOptions(this.fundsUrl(investorId) + '/cancel', {
        transferIds: transferIds
      }), cb)
    }
  },
  notes: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(api.accounts.accountsUrl + investorId + '/notes', PrepGetRequestOptions(), cb)
  },
  detailedNotes: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(api.accounts.accountsUrl + investorId + '/detailednotes', PrepGetRequestOptions(), cb)
  },
  portfolios: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(this.portfoliosUrl(investorId), PrepGetRequestOptions(), cb)
  },
  createPortfolio: function (investorId, actorId, portfolioName, portfolioDescription, cb) {
    SanitizeState(investorId, actorId, portfolioName)
    MakeRequest(this.portfoliosUrl(investorId), PrepPostRequestOptions({
      actorId: actorId,
      portfolioName: portfolioName,
      portfolioDescription: portfolioDescription
    }), cb)
  },
  filters: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(this.filtersUrl(investorId), PrepGetRequestOptions(), cb)
  },
  // orders is expected to be an array of objects with the following schema:
  // {
  //    loanId: <loanId>,
  //    requestedAmount: <requestedAmount>,
  //    portfolioId: <portfolioId>; nullable
  // }

  // TODO
  submitOrder: function (investorId, orders, cb) {
    SanitizeState(investorId, orders)
    MakeRequest(api.accounts.accountsUrl + investorId + '/orders',
      PrepPostRequestOptions({
        aid: investorId,
        orders: orders
      }), cb)
  },
  createOrderObject: function (loanId, requestedAmount, portfolioId) {
    return {
      loanId: loanId,
      requestedAmount: requestedAmount,
      portfolioId: portfolioId
    }
  }
}

api.loans = {
  listing: function (showAll, cb) {
    if (typeof (showAll) === 'function') {
      cb = showAll
      showAll = null
    }

    let url = 'https://api.lendingclub.com/api/investor/' + api.version + '/loans/listing'

    if (showAll) {
      url += '?showAll=true'
    }

    SanitizeState()
    MakeRequest(url, PrepGetRequestOptions(), cb)
  }
}

api.folio = {
  // expireDate is expected to be a String formatted mm/dd/yyyy date of order expiration
  // notes is expected to be an array of objects with the following schema:
  // {
  //    loanId: <loanId>,
  //    orderId: <orderId>,
  //    noteId: <nodeId>,
  //    askingPrice: <askingPrice>,
  // }
  sell: function (investorId, expireDate, notes, cb) {
    SanitizeState(investorId, expireDate, notes)
    MakeRequest(PrepPostRequestOptions(api.accounts.accountsUrl + investorId + '/trades/sell', {
      aid: investorId,
      expireDate: expireDate,
      notes: notes
    }), cb)
  },
  buy: function (investorId, expireDate, notes, cb) {
    SanitizeState(investorId, expireDate, notes)
    MakeRequest(PrepPostRequestOptions(api.accounts.accountsUrl + investorId + '/trades/buy', {
      aid: investorId,
      expireDate: expireDate,
      notes: notes
    }), cb)
  }
}

module.exports = api

function MakeRequest (url, options, cb) {
  console.log(url, options)
  fetch(url, options).then((res) => {
    if (res.ok) {
      return res.json()
    } else {
      throw new Error(res.statusText)
    }
  }).then((res) => {
    cb(res)
  }).catch((err) => {
    console.error(err)
  })
}

function SanitizeState () {
  if (!api.apiKey) {
    throw new Error('lendingClubAPI is not initializd')
  }

  for (const argumentIndex in arguments) {
    if (!arguments[argumentIndex] || (Object.prototype.hasOwnProperty.call(arguments[argumentIndex], 'length') && arguments[argumentIndex].length === 0)) {
      console.log(arguments)
      throw new Error('invalid argument i=' + argumentIndex)
    }
  }
}

function PrepPostRequestOptions (data) {
  return {
    body: JSON.stringify(data),
    method: 'post',
    headers: {
      Authorization: api.apiKey,
      'Content-Type': 'application/json'
    }
  }
}

function PrepGetRequestOptions () {
  return {
    headers: new Headers({
      Authorization: api.apiKey
    })
  }
}
