/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDeposit = /* GraphQL */ `
  subscription OnCreateDeposit($owner: String!) {
    onCreateDeposit(owner: $owner) {
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
export const onUpdateDeposit = /* GraphQL */ `
  subscription OnUpdateDeposit($owner: String!) {
    onUpdateDeposit(owner: $owner) {
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
export const onDeleteDeposit = /* GraphQL */ `
  subscription OnDeleteDeposit($owner: String!) {
    onDeleteDeposit(owner: $owner) {
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
      __typename
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
      __typename
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
      __typename
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
export const onCreateFxRate = /* GraphQL */ `
  subscription OnCreateFxRate($owner: String!) {
    onCreateFxRate(owner: $owner) {
      id
      currency
      date
      rate
      source
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateFxRate = /* GraphQL */ `
  subscription OnUpdateFxRate($owner: String!) {
    onUpdateFxRate(owner: $owner) {
      id
      currency
      date
      rate
      source
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteFxRate = /* GraphQL */ `
  subscription OnDeleteFxRate($owner: String!) {
    onDeleteFxRate(owner: $owner) {
      id
      currency
      date
      rate
      source
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
