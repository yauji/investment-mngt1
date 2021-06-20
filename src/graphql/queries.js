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
      principalAccountId
      principalAccount {
        id
        name
        currency
        balance
        exchangeRate
        memo
        createdAt
        updatedAt
        owner
      }
      principal
      exchangeRate
      interestRate
      duration
      endDate
      valueAccountId
      valueAccount {
        id
        name
        currency
        balance
        exchangeRate
        memo
        createdAt
        updatedAt
        owner
      }
      value
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
        principalAccountId
        principalAccount {
          id
          name
          currency
          balance
          exchangeRate
          memo
          createdAt
          updatedAt
          owner
        }
        principal
        exchangeRate
        interestRate
        duration
        endDate
        valueAccountId
        valueAccount {
          id
          name
          currency
          balance
          exchangeRate
          memo
          createdAt
          updatedAt
          owner
        }
        value
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
      name
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
        name
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
      trustBalanceId
      trustBalance {
        id
        currency
        name
        memo
        balance
        noItem
        basicPrice
        trustTransactions {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      date
      tradeType
      basicPrice
      basicPriceForeign
      noItem
      buy
      sell
      dividend
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
        trustBalanceId
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
        buy
        sell
        dividend
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
      trustTransactions {
        items {
          id
          trustBalanceId
          date
          tradeType
          basicPrice
          basicPriceForeign
          noItem
          buy
          sell
          dividend
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
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
        trustTransactions {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
