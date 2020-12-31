const limiter = require('simple-rate-limiter')
const request = limiter(require('request')).to(1).per(1000)

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
  // gets
  summary: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(PrepGetRequestOptions(api.accounts.accountsUrl + investorId + '/summary'), cb)
  },
  availableCash: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(PrepGetRequestOptions(api.accounts.accountsUrl + investorId + '/availablecash'), cb)
  },
  funds: {
    fundsUrl: function (investorId) {
      return api.accounts.accountsUrl + investorId + '/funds'
    },
    pending: function (investorId, cb) {
      SanitizeState(investorId)
      MakeRequest(PrepGetRequestOptions(this.fundsUrl(investorId) + '/pending'), cb)
    },
    transferFrequency: {
      LOAD_NOW: 'LOAD_NOW',
      LOAD_ONCE: 'LOAD_ONCE',
      LOAD_WEEKLY: 'LOAD_WEEKLY',
      LOAD_BIWEEKLY: 'LOAD_BIWEEKLY',
      LOAD_ON_DAY_1_AND_16: 'LOAD_ON_DAY_1_AND_16',
      LOAD_MONTHLY: 'LOAD_MONTHLY'
    },
    add: function (investorId, amount, transferFrequency, startDate, endDate, estimatedFundsTransferStartDate, cb) {
      SanitizeState(investorId, amount, estimatedFundsTransferStartDate)
      MakeRequest(PrepPostRequestOptions(this.fundsUrl(investorId) + '/add', {
        transferFrequency: transferFrequency,
        amount: amount,
        startDate: startDate,
        endDate: endDate,
        estimatedFundsTransferStartDate: estimatedFundsTransferStartDate
      }), cb)
    },
    withdraw: function (investorId, amount, estimatedFundsTransferStartDate, cb) {
      SanitizeState(investorId, amount, estimatedFundsTransferStartDate)
      MakeRequest(PrepPostRequestOptions(this.fundsUrl(investorId) + '/withdraw', {
        amount: amount,
        estimatedFundsTransferStartDate: estimatedFundsTransferStartDate
      }), cb)
    },
    cancel: function (investorId, transferIds, cb) {
      SanitizeState(investorId, transferIds)
      MakeRequest(PrepPostRequestOptions(this.fundsUrl(investorId) + '/cancel', {
        transferIds: transferIds
      }), cb)
    }
  },
  notes: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(PrepGetRequestOptions(api.accounts.accountsUrl + investorId + '/notes'), cb)
  },
  detailedNotes: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(PrepGetRequestOptions(api.accounts.accountsUrl + investorId + '/detailednotes'), cb)
  },
  portfolios: function (investorId, cb) {
    SanitizeState(investorId)
    MakeRequest(PrepGetRequestOptions(this.portfoliosUrl(investorId)), cb)
  },
  createPortfolio: function (investorId, accountId, portfolioName, portfolioDescription, cb) {
    SanitizeState(investorId, accountId, portfolioName)
    MakeRequest(PrepPostRequestOptions(this.portfoliosUrl(investorId), {
      actorId: accountId,
      portfolioName: portfolioName,
      portfolioDescription: portfolioDescription
    }), cb)
  },
  // orders is expected to be an array of objects with the following schema:
  // {
  //    loanId: <loanId>,
  //    requestedAmount: <requestedAmount>,
  //    portfolioId: <portfolioId>; nullable
  // }
  submitOrder: function (investorId, orders, cb) {
    SanitizeState(investorId, orders)
    MakeRequest(PrepPostRequestOptions(api.accounts.accountsUrl + investorId + '/orders', {
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
    MakeRequest(PrepGetRequestOptions(url), cb)
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

function MakeRequest (options, cb) {
  request(options, function (err, res, body) {
    if (cb) {
      if (err) {
        cb(err)
      } else if (res.statusCode / 100 !== 2) {
        cb(err, 'non 200 statusCode: ' + res.statusCode + ', ' + res.body)
      } else {
        try {
          cb(null, JSON.parse(body))
        } catch (ex) {
          cb(ex)
        }
      }
    }
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

function PrepPostRequestOptions (url, data) {
  return {
    url: url,
    body: JSON.stringify(data),
    method: 'post',
    headers: {
      Authorization: api.apiKey,
      'content-type': 'application/json'
    }
  }
}

function PrepGetRequestOptions (url) {
  return {
    url: url,
    headers: {
      Authorization: api.apiKey
    },
    method: 'get'
  }
}
