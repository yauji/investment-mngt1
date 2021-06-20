/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDeposit = /* GraphQL */ `
  subscription OnCreateDeposit($owner: String!) {
    onCreateDeposit(owner: $owner) {
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
export const onUpdateDeposit = /* GraphQL */ `
  subscription OnUpdateDeposit($owner: String!) {
    onUpdateDeposit(owner: $owner) {
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
export const onDeleteDeposit = /* GraphQL */ `
  subscription OnDeleteDeposit($owner: String!) {
    onDeleteDeposit(owner: $owner) {
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
export const onCreateAccount = /* GraphQL */ `
  subscription OnCreateAccount($owner: String!) {
    onCreateAccount(owner: $owner) {
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
export const onUpdateAccount = /* GraphQL */ `
  subscription OnUpdateAccount($owner: String!) {
    onUpdateAccount(owner: $owner) {
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
export const onDeleteAccount = /* GraphQL */ `
  subscription OnDeleteAccount($owner: String!) {
    onDeleteAccount(owner: $owner) {
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
export const onCreateTrustTransaction = /* GraphQL */ `
  subscription OnCreateTrustTransaction($owner: String!) {
    onCreateTrustTransaction(owner: $owner) {
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
export const onUpdateTrustTransaction = /* GraphQL */ `
  subscription OnUpdateTrustTransaction($owner: String!) {
    onUpdateTrustTransaction(owner: $owner) {
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
export const onDeleteTrustTransaction = /* GraphQL */ `
  subscription OnDeleteTrustTransaction($owner: String!) {
    onDeleteTrustTransaction(owner: $owner) {
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
export const onCreateTrustBalance = /* GraphQL */ `
  subscription OnCreateTrustBalance($owner: String!) {
    onCreateTrustBalance(owner: $owner) {
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
export const onUpdateTrustBalance = /* GraphQL */ `
  subscription OnUpdateTrustBalance($owner: String!) {
    onUpdateTrustBalance(owner: $owner) {
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
export const onDeleteTrustBalance = /* GraphQL */ `
  subscription OnDeleteTrustBalance($owner: String!) {
    onDeleteTrustBalance(owner: $owner) {
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
