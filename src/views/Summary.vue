<template>
  <div>
    <h1>Summary</h1>

    <b-col sm="12" class="mb-5">
      <b-button variant="success" v-on:click="getData">表示</b-button>
      <hr />
    </b-col>

    principal: {{ this.principal }}
    <br />
    evaluated value: {{ this.value }}
    <br />

    <router-link :to="{ name: 'DepositCreate' }">
      <button class="btn btn-primary">Add Deposit</button>
    </router-link>

    <router-link custom v-slot="{ navigate }" :to="{ name: 'DepositCreate' }">
      <button class="btn btn-primary" @click="navigate">Add Deposit</button>
    </router-link>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import {
  listDeposits,
  listAccounts,
  listTrustTransactions,
  listTrustBalances,
} from "../graphql/queries";
import { deleteDeposit } from "../graphql/mutations";

//import { listDeposits } from "../../graphql/queries";
//import { deleteDeposit } from "../../graphql/mutations";

import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "DepositIndex",
  async created() {
    //this.getDeposits();

    //this.principal = 1;
    //calc principal--------
    //calc value---------
    var principal = 0;
    var value = 0;
    console.log(value);

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

    const dAccounts = [];
    for (const ka in accounts) {
      const a = accounts[ka];
      dAccounts[a.currency] = a;
    }
    //console.log("-------123");
    //console.log(dAccounts);

    //get deposits----
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

    for (const kd in deposits) {
      const d = deposits[kd];

      //principal---
      principal += d.principalJPY;

      //value-------
      //value - deposit----
      if (d.status == Enum.EnumDepositStatus.ACTIVE.val) {
        if (d.principalCurrency == Enum.EnumCurrency.JPY.val) {
          value += d.principalJPY;
        } else {
          //foreign, evaluate with exchange rate---
          const exrate = dAccounts[d.principalCurrency].exchangeRate;
          //console.log("---------2");
          value += exrate * d.principalForeign;
        }
      } else {
        if (d.valueCurrency == Enum.EnumCurrency.JPY.val) {
          value += d.valueJPY;
        }
      }
    }

    //value - account----
    for (const ka in accounts) {
      const a = accounts[ka];
      value += a.balance * a.exchangeRate;
      //console.log("------3");
      //console.log(a.balance * a.exchangeRate);
    }

    // principal, value - trust transaction----
    var trusttransactions = {};
    await API.graphql({
      query: listTrustTransactions,
    })
      .then((result) => {
        console.log(result);
        trusttransactions = result.data.listTrustTransactions.items;
      })
      .catch((error) => {
        console.log(error);
      });

    for (const ktt in trusttransactions) {
      const tt = trusttransactions[ktt];
      if (tt.tradeType == Enum.EnumTradeType.BUY.val) {
        //console.log("-------1");
        //console.log(tt);
        principal += tt.buyJPY;
      } else {
        value += tt.sellJPY;
        value += tt.dividendJPY;
      }
    }

    // value - trust balance----
    var trustbalances = {};
    await API.graphql({
      query: listTrustBalances,
    })
      .then((result) => {
        console.log(result);
        trustbalances = result.data.listTrustBalances.items;
        //this.TrustBalances = result.data.listTrustBalances.items;
      })
      .catch((error) => {
        console.log(error);
      });
    //console.log(trustbalances);

    for (const ktb in trustbalances) {
      const tb = trustbalances[ktb];
      if(tb.currency == Enum.EnumCurrency.JPY.val){
        value += tb.balance;
      }else{
        //foreign currency
        value += tb.balance * dAccounts[tb.currency].exchangeRate;
        
      }
    }
    //console.log(principal);
    this.principal = principal;
    this.value = value;
  },
  data() {
    return {
      //albums: [],
      deposits: [],

      apiName: "apif8da427c",

      path: "/summary",
      id: "",
      name: "",
      text: "",

      principal: 0,
      value: 0,
    };
  },
  methods: {
    getData: function () {
      // 検索ID指定
      const path = this.path + "/" + this.text;
      // オプション
      const myInit = {
        headers: {},
        response: true,
      };
      // データ取得
      API.get(this.apiName, path, myInit).then((response) => {
        console.log(response);

        // テーブル表示
        this.items = [
          {
            id: response.data[0].id,
            name: response.data[0].name,
          },
        ];
      });
      //.catch((error) => {
      // テーブルリセット
      //  this.items = [];
      //});
    },

    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    async getDeposits() {
      await API.graphql({
        query: listDeposits,
      })
        .then((result) => {
          console.log(result);
          this.deposits = result.data.listDeposits.items;
          //this.Deposits = result.data.listDeposits.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async deleteDeposit(index, depositId) {
      if (!confirm("Delete Deposit?")) return;

      await API.graphql({
        //query: deleteDeposit,
        query: deleteDeposit,
        variables: { input: { id: depositId } },
      })
        .then((result) => {
          console.log(result);
          this.depositss.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>