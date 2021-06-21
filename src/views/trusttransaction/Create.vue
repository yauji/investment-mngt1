<template>
  <div>
    <h1>New TrustTransaction</h1>

    <form @submit.prevent="submitCreate">
      <input type="submit" value="Submit" />

      <div class="mb-3">
        <label for="" class="form-label">date *</label>
        <datepicker v-model="form.date" class="form-control" required />
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
        <label for="" class="form-label">account *</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.accountId"
          @change="onChangePrincipalCurrency()"
          required
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">tradeType *</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.tradeType"
          @change="onChangeTrustTransactionType()"
          required
        >
          <option
            v-for="n in refEnum.EnumTradeType"
            v-bind:key="n"
            v-bind:value="n.val"
          >
            {{ n.text }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">basicPrice</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.basicPrice"
          v-bind:disabled="dBasicPrice"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">noItem</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.noItem"
          v-bind:disabled="dNoItem"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">buy</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.buy"
          v-bind:disabled="dBuy"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">sell</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.sell"
          v-bind:disabled="dSell"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">dividend</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.dividend"
          v-bind:disabled="dDividend"
        />
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";

import { createTrustTransaction } from "../../graphql/mutations";
import { listTrustBalances, listAccounts } from "../../graphql/queries";

//import { createTrustTransaction, updateAccount } from "../../graphql/mutations";
//import { listAccounts } from "../../graphql/queries";

import Datepicker from "vue3-datepicker";

import * as Enum from "@/Enum";
//import * as Enum from '../../enum';

export default {
  name: "TrustTransactionCreate",

  components: {
    Datepicker,
  },
  computed: {
    refEnum: () => Enum,
  },
  async created() {
    this.getTrustBalances();
    this.getAccounts();
  },
  data() {
    return {
      //picked: "",
      form: {
        tradeType: "BUY",
        basicPrice: 0,
        //basicPriceForeign: 0,
        noItem: 0,

        buy: 0,
        //buyForeign: 0,
        sell: 0,
        //sellForeign: 0,
        dividend: 0,
        //dividendForeign: 0,

        trustBalanceId: "",
      },
      /*
      dBasicPrice: true,
      //dBasicPriceForeign: true,
      dNoItem: true,

      dBuy: true,
      //dBuyForeign: true,
      dSell: true,
      //dSellForeign: true,
      dDividend: true,
      //dDividendForeign: true,
*/
      trustbalances: [],
      accounts: [],
    };
  },
  methods: {
    async getTrustBalances() {
      await API.graphql({
        query: listTrustBalances,
      })
        .then((result) => {
          console.log(result);
          this.trustbalances = result.data.listTrustBalances.items;
          //this.TrustBalances = result.data.listTrustBalances.items;
        })
        .catch((error) => {
          console.log(error);
        });
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
    disableAll: function () {
      //TODO: update
      
      this.dBasicPrice = true;
      this.dBasicPriceForeign = true;
      this.dNoItem = true;

      this.dBuyJPY = true;
      this.dBuyForeign = true;
      this.dSellJPY = true;
      this.dSellForeign = true;
      this.dDividendJPY = true;
      this.dDividendForeign = true;
    },
    onChangeTrustTransactionType: function () {
      this.disableAll();

      //      this.form.status = Enum.EnumTrustTransactionStatus.ACTIVE.val;

      if (this.form.tradeType == Enum.EnumTradeType.BUY.val) {
        this.dBasicPrice = false;
        this.dBasicPriceForeign = false;
        this.dNoItem = false;

        this.dBuyJPY = false;
        this.dBuyForeign = false;
      } else if (this.form.tradeType == Enum.EnumTradeType.SELL.val) {
        this.dBasicPrice = false;
        this.dBasicPriceForeign = false;
        this.dNoItem = false;

        this.dSellJPY = false;
        this.dSellForeign = false;
      } else if (this.form.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
        this.dDividendJPY = false;
        this.dDividendForeign = false;
      }
    },
    onChangePrincipalCurrency: function () {
      if (this.form.principalCurrency == "JPY") {
        this.dPrincipalJPY = false;
      } else {
        this.dPrincipalForeign = false;
      }
    },

    async submitCreate() {
      var targetTb = 0;
      for (const k in this.trustbalances) {
        //console.log(k);
        //        console.log("xxxxxxxx1", k, tb);

        if (this.trustBalanceId == this.trustbalances[k].id) {
          targetTb = this.trustbalances[k];
          console.log("------1");
          console.log(targetTb);
        }
      }

      //this.form.trustBalance = targetTb;

      console.log(this.form);
      await API.graphql({
        query: createTrustTransaction,
        variables: { input: this.form },
      })
        .then((result) => {
          console.log(result);
          this.$router.push({ name: "TrustTransactionIndex" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>