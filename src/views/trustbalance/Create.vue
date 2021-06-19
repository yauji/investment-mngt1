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
        <label for="" class="form-label">buyJPY</label>
        <input
          type="number"
          step="1"
          class="form-control"
          v-model="form.buyJPY"
          v-bind:disabled="dBuyJPY"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">buyForeign</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.buyForeign"
          v-bind:disabled="dBuyForeign"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">sellJPY</label>
        <input
          type="number"
          step="1"
          class="form-control"
          v-model="form.sellJPY"
          v-bind:disabled="dSellJPY"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">sellForeign</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.sellForeign"
          v-bind:disabled="dSellForeign"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">dividendJPY</label>
        <input
          type="number"
          step="1"
          class="form-control"
          v-model="form.dividendJPY"
          v-bind:disabled="dDividendJPY"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">dividendForeign</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model="form.dividendForeign"
          v-bind:disabled="dDividendForeign"
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

        buyJPY: 0,
        buyForeign: 0,
        sellJPY: 0,
        sellForeign: 0,
        dividendJPY: 0,
        dividendForeign: 0,
      },
      dBasicPrice: true,
      dBasicPriceForeign: true,
      dNoItem: true,

      dBuyJPY: true,
      dBuyForeign: true,
      dSellJPY: true,
      dSellForeign: true,
      dDividendJPY: true,
      dDividendForeign: true,
    };
  },
  methods: {
    disableAll: function () {
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