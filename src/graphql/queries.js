/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDeposit = /* GraphQL */ `
  query GetDeposit($id: ID!) {
    getDeposit(id: $id) {
      id
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
        __typename
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
        __typename
      }
      value
      createdAt
      updatedAt
      owner
      __typename
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
        name
        memo
        status
        date
        principalAccountId
        principal
        exchangeRate
        interestRate
        duration
        endDate
        valueAccountId
        value
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
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
      __typename
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
        __typename
      }
      nextToken
      __typename
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
        averagePurchasePrice
        code
        type
        createdAt
        updatedAt
        owner
        __typename
      }
      accountId
      account {
        id
        name
        currency
        balance
        exchangeRate
        memo
        createdAt
        updatedAt
        owner
        __typename
      }
      date
      tradeType
      basicPrice
      noItem
      buy
      sell
      dividend
      createdAt
      updatedAt
      owner
      __typename
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
        accountId
        date
        tradeType
        basicPrice
        noItem
        buy
        sell
        dividend
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
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
      averagePurchasePrice
      code
      type
      trustTransactions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
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
        averagePurchasePrice
        code
        type
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
