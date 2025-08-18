/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDeposit = /* GraphQL */ `
  mutation CreateDeposit(
    $input: CreateDepositInput!
    $condition: ModelDepositConditionInput
  ) {
    createDeposit(input: $input, condition: $condition) {
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
export const updateDeposit = /* GraphQL */ `
  mutation UpdateDeposit(
    $input: UpdateDepositInput!
    $condition: ModelDepositConditionInput
  ) {
    updateDeposit(input: $input, condition: $condition) {
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
export const deleteDeposit = /* GraphQL */ `
  mutation DeleteDeposit(
    $input: DeleteDepositInput!
    $condition: ModelDepositConditionInput
  ) {
    deleteDeposit(input: $input, condition: $condition) {
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
export const createAccount = /* GraphQL */ `
  mutation CreateAccount(
    $input: CreateAccountInput!
    $condition: ModelAccountConditionInput
  ) {
    createAccount(input: $input, condition: $condition) {
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
export const updateAccount = /* GraphQL */ `
  mutation UpdateAccount(
    $input: UpdateAccountInput!
    $condition: ModelAccountConditionInput
  ) {
    updateAccount(input: $input, condition: $condition) {
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
export const deleteAccount = /* GraphQL */ `
  mutation DeleteAccount(
    $input: DeleteAccountInput!
    $condition: ModelAccountConditionInput
  ) {
    deleteAccount(input: $input, condition: $condition) {
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
export const createTrustTransaction = /* GraphQL */ `
  mutation CreateTrustTransaction(
    $input: CreateTrustTransactionInput!
    $condition: ModelTrustTransactionConditionInput
  ) {
    createTrustTransaction(input: $input, condition: $condition) {
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
export const updateTrustTransaction = /* GraphQL */ `
  mutation UpdateTrustTransaction(
    $input: UpdateTrustTransactionInput!
    $condition: ModelTrustTransactionConditionInput
  ) {
    updateTrustTransaction(input: $input, condition: $condition) {
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
export const deleteTrustTransaction = /* GraphQL */ `
  mutation DeleteTrustTransaction(
    $input: DeleteTrustTransactionInput!
    $condition: ModelTrustTransactionConditionInput
  ) {
    deleteTrustTransaction(input: $input, condition: $condition) {
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
export const createTrustBalance = /* GraphQL */ `
  mutation CreateTrustBalance(
    $input: CreateTrustBalanceInput!
    $condition: ModelTrustBalanceConditionInput
  ) {
    createTrustBalance(input: $input, condition: $condition) {
      id
      currency
      name
      memo
      balance
      noItem
      basicPrice
      averagePurchasePrice
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
export const updateTrustBalance = /* GraphQL */ `
  mutation UpdateTrustBalance(
    $input: UpdateTrustBalanceInput!
    $condition: ModelTrustBalanceConditionInput
  ) {
    updateTrustBalance(input: $input, condition: $condition) {
      id
      currency
      name
      memo
      balance
      noItem
      basicPrice
      averagePurchasePrice
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
export const deleteTrustBalance = /* GraphQL */ `
  mutation DeleteTrustBalance(
    $input: DeleteTrustBalanceInput!
    $condition: ModelTrustBalanceConditionInput
  ) {
    deleteTrustBalance(input: $input, condition: $condition) {
      id
      currency
      name
      memo
      balance
      noItem
      basicPrice
      averagePurchasePrice
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
