<template>
  <div>
    <h1>Accounts</h1>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>currency</th>
          <th>balance</th>
          <th>exchangeRate</th>
          <th>memo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(account, index) in accounts" :key="account.id">
          <td>{{ account.currency }}</td>
          <td>{{ account.balance }}</td>
          <td>{{ account.exchangeRate }}</td>
          <td>{{ account.memo }}</td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'AccountShow', params: { accountId: account.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Show</button>
            </router-link>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'AccountEdit', params: { accountId: account.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Edit</button>
            </router-link>
            <button
              class="btn btn-primary"
              @click="deleteAccount(index, account.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <button class="btn btn-primary" @click="updateBalances()">
      Update balance
    </button>

    <br/>
    <br/>


    <router-link custom v-slot="{ navigate }" :to="{ name: 'AccountCreate' }">
      <button class="btn btn-primary" @click="navigate">Add Account</button>
    </router-link>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listAccounts, listDeposits } from "../../graphql/queries";
import { deleteAccount, updateAccount } from "../../graphql/mutations";
//import { deleteAccount, updateAccount } from "../../graphql/mutations";

import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "AccountIndex",
  async created() {
    //this.getAccounts();
    this.getAccounts();
  },
  data() {
    return {
      //albums: [],
      accounts: [],
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    async getAccounts() {
      await API.graphql({
        query: listAccounts,
      })
        .then((result) => {
          console.log(result);
          this.accounts = result.data.listAccounts.items;
          //this.Accounts = result.data.listAccounts.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async deleteAccount(index, accountId) {
      if (!confirm("Delete Account?")) return;

      await API.graphql({
        //query: deleteAccount,
        query: deleteAccount,
        variables: { input: { id: accountId } },
      })
        .then((result) => {
          console.log(result);
          this.accountss.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async updateBalances() {
      //get deposits
      var deposits;
      await API.graphql({
        query: listDeposits,
      })
        .then((result) => {
          //console.log(result);
          deposits = result.data.listDeposits.items;
        })
        .catch((error) => {
          console.log(error);
        });

      //console.log(deposits);

      //get accounts---
      var accounts;
      await API.graphql({
        query: listAccounts,
      })
        .then((result) => {
          //console.log(result);
          accounts = result.data.listAccounts.items;
        })
        .catch((error) => {
          console.log(error);
        });

      //console.log(accounts);

      // create dic----
      var dicDepositBalanceEachCurrency = [];

      for (const a in accounts) {
        dicDepositBalanceEachCurrency[accounts[a].currency] = 0;
      }

      for (const kd in deposits) {
        //console.log(deposits[kd]);
        const d = deposits[kd];
        if (d.status == Enum.EnumDepositStatus.FINISHED.val) {
          if (
            d.depositType == Enum.EnumDepositType.DEPOSIT_JPY.val ||
            d.depositType ==
              Enum.EnumDepositType.BUY_FOREIGN_CURRENCY_BY_JPY.val
          ) {
            dicDepositBalanceEachCurrency[d.valueCurrency] += d.valueForeign;
          } else if (
            d.depositType == Enum.EnumDepositType.DEPOSIT_FC.val ||
            d.depositType == Enum.EnumDepositType.BUY_FOREIGN_CURRENCY_BY_FC.val
          ) {
            dicDepositBalanceEachCurrency[d.valueCurrency] += d.valueForeign;
            dicDepositBalanceEachCurrency[d.principalCurrency] -=
              d.principlaForeign;
          } else if (
            d.depositType == Enum.EnumDepositType.SELL_FOREIGN_CURRENCY.val
          ) {
            dicDepositBalanceEachCurrency[d.principalCurrency] -=
              d.principlaForeign;
          }
        }
      }

      //console.log("------12");
      //console.log(dicDepositBalanceEachCurrency);

      for (const ka in accounts) {
        var a = accounts[ka];
        a.balance = dicDepositBalanceEachCurrency[a.currency];
        //console.log(a);

        delete a.createdAt;
        delete a.updatedAt;
        delete a.owner;

        await API.graphql({
          query: updateAccount,
          variables: { input: a },
        })
          .then((result) => {
            console.log(result);
            //this.$router.push({ name: "AccountIndex" });
          })
          .catch((error) => {
            console.log(error);
          });
      }

      //hoge
    },
  },
};
</script>