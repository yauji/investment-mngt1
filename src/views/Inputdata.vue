<template>
  <div>
    <h1>Inputdata</h1>

    <h3>deposit finished</h3>
    <br />

    plus xxx interest rate xxx duration

    <form @submit.prevent="submitCreate">
      <div class="mb-3">
        <label for="" class="form-label">principal account</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.principalAccountId"
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">value account</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.valueAccountId"
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">deposit jpy finished</label>
        <textarea class="form-control" v-model="form.dataDJF" />
      </div>

      <!--
-->

      <input type="submit" value="Submit" />
    </form>

    <hr />

    <h3>deposit active</h3>
    <br />

    <form @submit.prevent="submitCreateActive">
      <div class="mb-3">
        <label for="" class="form-label">principal account</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.principalAccountId"
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">deposit active</label>
        <textarea class="form-control" v-model="form.dataDA" />
      </div>

      <input type="submit" value="Submit" />
    </form>

    <br />

    <hr />
    <h3>trust transaction buy (rakuten)</h3>
    <br />

    <form @submit.prevent="submitCreateTrustTransactionBuy">
      <div class="mb-3">
        <label for="" class="form-label">principal account</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.principalAccountId"
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">trust balance *</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.trustBalanceId"
          required
        >
          <option v-for="n in trustbalances" v-bind:key="n" v-bind:value="n.id">
            {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">trust transaction buy</label>
        <textarea class="form-control" v-model="form.dataTTBuy" />
      </div>

      <input type="submit" value="Submit" />
    </form>

    <br />
  </div>
</template>

<script>
import { API } from "aws-amplify";
//import { listAccounts } from "../graphql/queries";

import { listTrustBalances, listAccounts } from "../graphql/queries";
//listDeposits,//listTrustTransactions,
//listTrustBalances,

import { createDeposit, createTrustTransaction } from "../graphql/mutations";

//import { listDeposits } from "../../graphql/queries";
//import { deleteDeposit } from "../../graphql/mutations";

//import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "DepositIndex",
  async created() {
    //this.getDeposits();
    this.getAccounts();
    this.getTrustBalances();
  },
  data() {
    return {
      form: {
        dataDJF: "",
      },
      apiName: "apif8da427c",

      path: "/inputdata",
      accounts: [],
      trustbalances: [],
    };
  },
  methods: {
    async submitCreate() {
      //console.log("----11");
      //console.log("xxxxxxxx", this.form.dataDJF);

      const str = this.form.dataDJF;

      var arr = str.split(/\r\n|\n/);

      for (var i = 0; i < arr.length; i++) {
        //console.log(arr[i]);
        var arr2 = arr[i].split(/xxx/);
        for (const k2 in arr2) {
          console.log(k2, arr2[k2]);
        }
        /*
         */
        var form = {};

        //form.depositType = "DEPOSIT_JPY";

        form.date = new Date(arr2[0]);
        form.name = arr2[1];
        form.memo = arr2[7];
        form.principal = parseFloat(arr2[16].replace(/,/g, ""));
        form.exchangeRate = 0;
        form.interestRate = parseFloat(arr2[18].replace(/,/g, ""));
        form.duration = parseFloat(arr2[19].replace(/,/g, ""));
        form.endDate = new Date(arr2[12]);
        form.value = parseFloat(arr2[17].replace(/,/g, ""));

        form.status = "FINISHED";

        //console.log("---13", this.form.accountId);

        form.principalAccountId = this.form.principalAccountId;
        form.valueAccountId = this.form.valueAccountId;

        //console.log(this.form.date);
        console.log("------", form);

        await API.graphql({
          query: createDeposit,
          variables: { input: form },
        })
          .then((result) => {
            console.log(result);
            //this.$router.push({ name: "DepositIndex" });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    async submitCreateActive() {
      const str = this.form.dataDA;

      var arr = str.split(/\r\n|\n/);

      for (var i = 0; i < arr.length; i++) {
        var arr2 = arr[i].split(/xxx/);
        for (const k2 in arr2) {
          console.log(k2, arr2[k2]);
        }
        var form = {};

        form.date = new Date(arr2[0]);
        form.name = arr2[1];
        form.memo = arr2[7];
        form.principal = parseFloat(arr2[16].replace(/,/g, ""));
        form.exchangeRate = 0;
        form.interestRate = parseFloat(arr2[18].replace(/,/g, ""));
        form.duration = parseFloat(arr2[19].replace(/,/g, ""));

        form.status = "ACTIVE";

        form.principalAccountId = this.form.principalAccountId;

        console.log("---active---", form);

        await API.graphql({
          query: createDeposit,
          variables: { input: form },
        })
          .then((result) => {
            console.log(result);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    async submitCreateTrustTransactionBuy() {
      console.log("---11");
      const str = this.form.dataTTBuy;
      //console.log(str);

      var arr = str.split(/\r\n|\n/);

      for (var i = 0; i < arr.length; i++) {
        var arr2 = arr[i].split(/xxx/);
        for (const k2 in arr2) {
          console.log(k2, arr2[k2]);
        }
        var form = {};

        //hoge
        form.date = new Date(arr2[0]);
        form.tradeType = Enum.EnumTradeType.BUY.val;

        form.trustBalanceId = this.form.trustBalanceId;
        form.accountId = this.form.principalAccountId;

        form.basicPrice = parseFloat(arr2[8].replace(/,/g, ""));

        //TODO
        form.noItem = parseFloat(arr2[7].replace(/,/g, "")) / 10000;
        form.buy = parseFloat(arr2[12].replace(/,/g, ""));
        //form.sell
        //form.dividend

        /*
      date
      tradeType
      trustBalanceId
      accountId

getTrustTransaction(id: $id) {
      id
      basicPrice
      noItem
      buy
      sell
      dividend
      createdAt
      updatedAt
      owner
      */

        console.log("---active---", form);

        await API.graphql({
          query: createTrustTransaction,
          variables: { input: form },
        })
          .then((result) => {
            console.log(result);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    async getAccounts() {
      await API.graphql({
        query: listAccounts,
      })
        .then((result) => {
          console.log(result);
          this.accounts = result.data.listAccounts.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async getTrustBalances() {
      await API.graphql({
        query: listTrustBalances,
      })
        .then((result) => {
          console.log(result);
          this.trustbalances = result.data.listTrustBalances.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>