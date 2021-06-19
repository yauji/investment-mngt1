/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDeposit = /* GraphQL */ `
  mutation CreateDeposit(
    $input: CreateDepositInput!
    $condition: ModelDepositConditionInput
  ) {
    createDeposit(input: $input, condition: $condition) {
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
export const updateDeposit = /* GraphQL */ `
  mutation UpdateDeposit(
    $input: UpdateDepositInput!
    $condition: ModelDepositConditionInput
  ) {
    updateDeposit(input: $input, condition: $condition) {
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
export const deleteDeposit = /* GraphQL */ `
  mutation DeleteDeposit(
    $input: DeleteDepositInput!
    $condition: ModelDepositConditionInput
  ) {
    deleteDeposit(input: $input, condition: $condition) {
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
export const createAccount = /* GraphQL */ `
  mutation CreateAccount(
    $input: CreateAccountInput!
    $condition: ModelAccountConditionInput
  ) {
    createAccount(input: $input, condition: $condition) {
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
export const updateAccount = /* GraphQL */ `
  mutation UpdateAccount(
    $input: UpdateAccountInput!
    $condition: ModelAccountConditionInput
  ) {
    updateAccount(input: $input, condition: $condition) {
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
export const deleteAccount = /* GraphQL */ `
  mutation DeleteAccount(
    $input: DeleteAccountInput!
    $condition: ModelAccountConditionInput
  ) {
    deleteAccount(input: $input, condition: $condition) {
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
export const createTrustTransaction = /* GraphQL */ `
  mutation CreateTrustTransaction(
    $input: CreateTrustTransactionInput!
    $condition: ModelTrustTransactionConditionInput
  ) {
    createTrustTransaction(input: $input, condition: $condition) {
      id
      trustBalance {
        id
        currency
        name
        memo
        balance
        noItem
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
export const updateTrustTransaction = /* GraphQL */ `
  mutation UpdateTrustTransaction(
    $input: UpdateTrustTransactionInput!
    $condition: ModelTrustTransactionConditionInput
  ) {
    updateTrustTransaction(input: $input, condition: $condition) {
      id
      trustBalance {
        id
        currency
        name
        memo
        balance
        noItem
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
export const deleteTrustTransaction = /* GraphQL */ `
  mutation DeleteTrustTransaction(
    $input: DeleteTrustTransactionInput!
    $condition: ModelTrustTransactionConditionInput
  ) {
    deleteTrustTransaction(input: $input, condition: $condition) {
      id
      trustBalance {
        id
        currency
        name
        memo
        balance
        noItem
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
      createdAt
      updatedAt
      owner
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
      createdAt
      updatedAt
      owner
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
      createdAt
      updatedAt
      owner
    }
  }
`;
