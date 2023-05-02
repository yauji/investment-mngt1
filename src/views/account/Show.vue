<template>
  <div>
    <h1>Account detail - {{ form.name }} - {{ form.currency }}</h1>

    <h3>Deposites</h3>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>name</th>
          <th>date</th>
          <th>status</th>
          <th>principal</th>
          <th></th>
          <th>value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="deposit in deposits" :key="deposit.id">
          <td>{{ deposit.name }}</td>
          <td>{{ moment(deposit.date) }}</td>
          <td>{{ deposit.status }}</td>
          <td>{{ numberFormat(deposit.principal) }}</td>
          <td>{{ deposit.principalAccountName }}</td>
          <td>{{ numberFormat(deposit.value) }}</td>
          <td>{{ deposit.valueAccountName }}</td>
        </tr>
      </tbody>
    </table>

    <h3>Trust transactions</h3>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>date</th>
          <th>buy</th>
          <th>sell</th>
          <th>trust</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="trusttransaction in trusttransactions"
          :key="trusttransaction.id"
        >
          <td>{{ moment(trusttransaction.date) }}</td>
          <td>{{ numberFormat(trusttransaction.buy) }}</td>
          <td>{{ numberFormat(trusttransaction.sell) }}</td>
          <td>{{ trusttransaction.trustBalance.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { getAccount } from "../../graphql/queries";
import {
  listAccounts,
  listDeposits,
  listTrustTransactions,
} from "../../graphql/queries";

//import { updateAccount } from "../../graphql/mutations";

//import Datepicker from "vue3-datepicker";

import moment from "moment";

//import * as Enum from "@/Enum";

export default {
  name: "AccountShow",
  props: {
    accountId: String,
  },
  async created() {
    //hoge
    //for display other account name
    await this.getAllAccounts();

    this.getAccount();
    this.getTrans();
  },
  data() {
    return {
      form: {},
      deposits: [],
      //for display other account name
      accounts: [],
      trusttransactions: [],
    };
  },

  methods: {
    numberFormat: function (value) {
      if (value == null) {
        return "---";
      } else {
        return value.toLocaleString();
      }
    },
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
    },
    /*
    async getAccountById (id) {
      
      await API.graphql({
        query: getAccount,
        variables: { id: id },
      })
        .then((result) => {
          console.log(result);
          //this.form = result.data.getAccount;
          //return result.name, result.currency;
          return result.data.getAccount;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    */
    getAccountById: function (id) {
      //hoge
      for (const a in this.accounts) {
        //console.log(a, id);
        if (this.accounts[a].id == id) {
          return this.accounts[a];
        }
      }
      //return "hogeaa";
    },
    async getAccount() {
      //console.log(this.accountId);
      //console.log(this.accounts);

      await API.graphql({
        query: getAccount,
        variables: { id: this.accountId },
      })
        .then((result) => {
          this.form = result.data.getAccount;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async getAllAccounts() {
      await API.graphql({
        query: listAccounts,
      })
        .then((result) => {
          //console.log(result);
          this.accounts = result.data.listAccounts.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async getTrans() {
      //get deposits-----
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

      //console.log("-----1", this.accounts);
      //var accounts = this.accounts;

      // create dic----
      var dicAccountIdBalance = [];

      for (const a in this.accounts) {
        dicAccountIdBalance[this.accounts[a].id] = 0;
      }

      for (const kd in deposits) {
        //console.log(deposits[kd]);
        const d = deposits[kd];

        if (d.principalAccountId == this.form.id) {
          //console.log("-----11", d);
          d.principalAccountName = this.form.name + " " + this.form.currency;

          //for display
          const tmpa = this.getAccountById(d.valueAccountId);
          //console.log(tmpa);
          d.valueAccountName = tmpa.name + " " + tmpa.currency;

          this.deposits.push(d);
        }
        if (d.valueAccountId == this.form.id) {
          //console.log("-----11", d);
          d.valueAccountName = this.form.name + " " + this.form.currency;

          //for display
          const tmpa = this.getAccountById(d.principalAccountId);          
          d.principalAccountName = tmpa.name + " " + tmpa.currency;

          this.deposits.push(d);
        }

        //console.log("-------11", d.principal, d.value);
        //dicAccountIdBalance[d.principalAccountId] -= d.principal;

        /*
        if (d.status == Enum.EnumDepositStatus.FINISHED.val) {
          //console.log("-----3", d.status);
          dicAccountIdBalance[d.valueAccountId] += d.value;
        }
        */
      }

      //console.log("------12");
      //console.log(dicAccountIdBalance);

      //trust transaction----
      //TODO
      //kokokara: update schema for account

      var trusttransactions = {};
      await API.graphql({
        query: listTrustTransactions,
      })
        .then((result) => {
          //console.log(result);
          trusttransactions = result.data.listTrustTransactions.items;
        })
        .catch((error) => {
          console.log(error);
        });
      //console.log(trusttransactions);

      for (const ktt in trusttransactions) {
        const tt = trusttransactions[ktt];

        if (tt.accountId == this.form.id) {
          //  console.log(tt);
          this.trusttransactions.push(tt);
        }
        /*
        if (tt.tradeType == Enum.EnumTradeType.BUY.val) {
          dicAccountIdBalance[tt.accountId] -= tt.buy;
          console.log("------31", tt.buy);
        } else if (tt.tradeType == Enum.EnumTradeType.SELL.val) {
          dicAccountIdBalance[tt.accountId] += tt.sell;
          console.log("------32", tt.sell);
        } else if (tt.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
          dicAccountIdBalance[tt.accountId] += tt.dividend;
          console.log("------33", tt);
        }
        */
      }
    },
  },
};
</script>