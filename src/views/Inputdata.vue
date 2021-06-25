<template>
  <div>
    <h1>Inputdata</h1>

    deposit finished
    <br/>

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

    2008/10/29xxxパワードル年金xxx新生銀行/ジブラルタ生命xxx2,000,800xxx$20,500xxxxxx2000800xxx"利率：3.57%,据え置き期間：10年,レート：97.6円"xxxxxx3,275,845xxxxxxxxx2018/11/1xxx3.57xxx120
    2009/02/07xxx円定期xxx新生銀行xxx1,000,000xxxxxxxxxxxx"金利：1.7%,期間：5年"xxxxxx1067770xxxxxxxxx2014/02/07xxx1.7xxx60

    <br />
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listAccounts } from "../graphql/queries";
//listDeposits,//listTrustTransactions,
//listTrustBalances,

import { createDeposit } from "../graphql/mutations";

//import { listDeposits } from "../../graphql/queries";
//import { deleteDeposit } from "../../graphql/mutations";

//import moment from "moment";

//import * as Enum from "@/Enum";

export default {
  name: "DepositIndex",
  async created() {
    //this.getDeposits();
    this.getAccounts();
  },
  data() {
    return {
      form: {
        dataDJF: "",
      },
      apiName: "apif8da427c",

      path: "/inputdata",
      accounts: [],
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
        form.principal = parseFloat(arr2[16].replace(/,/g,""));
        form.exchangeRate = 0;
        form.interestRate = parseFloat(arr2[18].replace(/,/g,""));
        form.duration = parseFloat(arr2[19].replace(/,/g,""));
        form.endDate = new Date(arr2[12]);
        form.value = parseFloat(arr2[17].replace(/,/g,""));

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
  },
};
</script>