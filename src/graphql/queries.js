/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDeposit = /* GraphQL */ `
  query GetDeposit($id: ID!) {
    getDeposit(id: $id) {
      id
      depositType
      name
      memo
      status
      date
      principalCurrency
      principalJPY
      principalForeign
      exchangeRate
      interestRate
      duration
      endDate
      valueCurrency
      valueJPY
      valueForeign
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listDeposits = /* GraphQL */ `
  query ListDeposits(
    $filter: ModelDepositFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDeposits(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        depositType
        name
        memo
        status
        date
        principalCurrency
        principalJPY
        principalForeign
        exchangeRate
        interestRate
        duration
        endDate
        valueCurrency
        valueJPY
        valueForeign
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getAccount = /* GraphQL */ `
  query GetAccount($id: ID!) {
    getAccount(id: $id) {
      id
      currency
      balance
      exchangeRate
      memo
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listAccounts = /* GraphQL */ `
  query ListAccounts(
    $filter: ModelAccountFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAccounts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        currency
        balance
        exchangeRate
        memo
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getTrustTransaction = /* GraphQL */ `
  query GetTrustTransaction($id: ID!) {
    getTrustTransaction(id: $id) {
      id
      trustBalance {
        id
        currency
        name
        memo
        balance
        noItem
        basicPrice
        createdAt
        updatedAt
        owner
      }
      date
      tradeType
      basicPrice
      basicPriceForeign
      noItem
      buyJPY
      buyForeign
      sellJPY
      sellForeign
      dividendJPY
      dividendForeign
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listTrustTransactions = /* GraphQL */ `
  query ListTrustTransactions(
    $filter: ModelTrustTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTrustTransactions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        trustBalance {
          id
          currency
          name
          memo
          balance
          noItem
          basicPrice
          createdAt
          updatedAt
          owner
        }
        date
        tradeType
        basicPrice
        basicPriceForeign
        noItem
        buyJPY
        buyForeign
        sellJPY
        sellForeign
        dividendJPY
        dividendForeign
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getTrustBalance = /* GraphQL */ `
  query GetTrustBalance($id: ID!) {
    getTrustBalance(id: $id) {
      id
      currency
      name
      memo
      balance
      noItem
      basicPrice
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listTrustBalances = /* GraphQL */ `
  query ListTrustBalances(
    $filter: ModelTrustBalanceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTrustBalances(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        currency
        name
        memo
        balance
        noItem
        basicPrice
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
