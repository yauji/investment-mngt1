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
          step="1"
          class="form-control"
          v-model="form.basicPrice"
          v-bind:disabled="dBasicPrice"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">basicPriceForeign</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.basicPriceForeign"
          v-bind:disabled="dBasicPriceForeign"
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
        <label for="" class="form-label">buyValueJPY</label>
        <input
          type="number"
          step="1"
          class="form-control"
          v-model="form.buyValueJPY"
          v-bind:disabled="dBuyValueJPY"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">buyValueForeign</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.buyValueForeign"
          v-bind:disabled="dBuyValueForeign"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">sellValueJPY</label>
        <input
          type="number"
          step="1"
          class="form-control"
          v-model="form.sellValueJPY"
          v-bind:disabled="dSellValueJPY"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">sellValueForeign</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.sellValueForeign"
          v-bind:disabled="dSellValueForeign"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">dividendValueJPY</label>
        <input
          type="number"
          step="1"
          class="form-control"
          v-model="form.dividendValueJPY"
          v-bind:disabled="dDividendValueJPY"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">dividendValueForeign</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.dividendValueForeign"
          v-bind:disabled="dDividendValueForeign"
        />
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";

import { createTrustTransaction } from "../../graphql/mutations";

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
  data() {
    return {
      //picked: "",
      form: {
        tradeType: "BUY",
        basicPrice: 0,
        basicPriceForeign: 0,
        noItem: 0,

        buyValueJPY: 0,
        buyValueForeign: 0,
        sellValueJPY: 0,
        sellValueForeign: 0,
        dividendValueJPY: 0,
        dividendValueForeign: 0,
      },
      dBasicPrice: true,
      dBasicPriceForeign: true,
      dNoItem: true,

      dBuyValueJPY: true,
      dBuyValueForeign: true,
      dSellValueJPY: true,
      dSellValueForeign: true,
      dDividendValueJPY: true,
      dDividendValueForeign: true,
    };
  },
  methods: {
    disableAll: function () {
      this.dBasicPrice = true;
      this.dBasicPriceForeign = true;
      this.dNoItem = true;

      this.dBuyValueJPY = true;
      this.dBuyValueForeign = true;
      this.dSellValueJPY = true;
      this.dSellValueForeign = true;
      this.dDividendValueJPY = true;
      this.dDividendValueForeign = true;
    },
    onChangeTrustTransactionType: function () {
      this.disableAll();

      //      this.form.status = Enum.EnumTrustTransactionStatus.ACTIVE.val;

      if (this.form.tradeType == Enum.EnumTradeType.BUY.val) {
        this.dBasicPrice = false;
        this.dBasicPriceForeign = false;
        this.dNoItem = false;

        this.dBuyValueJPY = false;
        this.dBuyValueForeign = false;
      } else if (this.form.tradeType == Enum.EnumTradeType.SELL.val) {
        this.dBasicPrice = false;
        this.dBasicPriceForeign = false;
        this.dNoItem = false;

        this.dSellValueJPY = false;
        this.dSellValueForeign = false;
      } else if (this.form.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
        this.dDividendValueJPY = false;
        this.dDividendValueForeign = false;
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
      //this.form.status = "ACTIVE";

      //console.log("xxxxxxxx");
      //console.log(this.form.date);
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