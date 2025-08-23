<template>
  <div>
    <h1>New TrustTransaction</h1>

    <form @submit.prevent="submitCreate">
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
          required
        >
          <option v-for="n in accounts" v-bind:key="n" v-bind:value="n.id">
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
          step="0.0001"
          class="form-control"
          v-model.number="form.basicPrice"
          :disabled="isBasicPriceDisabled"
          @input="onChangeBasicPriceNoItem()"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">noItem</label>
        <input
          type="number"
          step="0.0001"
          class="form-control"
          v-model.number="form.noItem"
          :disabled="isNoItemDisabled"
          @input="onChangeBasicPriceNoItem()"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">buy</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model.number="form.buy"
          :disabled="isBuyDisabled"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">sell</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model.number="form.sell"
          :disabled="isSellDisabled"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">dividend</label>
        <input
          type="number"
          step="0.01"
          class="form-control"
          v-model.number="form.dividend"
          :disabled="isDividendDisabled"
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
    isBasicPriceDisabled() {
      const t = this.form.tradeType;
      return !(
        t === Enum.EnumTradeType.BUY.val ||
        t === Enum.EnumTradeType.SELL.val ||
        t === Enum.EnumTradeType.DIVIDEND.val
      );
    },
    isNoItemDisabled() {
      const t = this.form.tradeType;
      return !(
        t === Enum.EnumTradeType.BUY.val ||
        t === Enum.EnumTradeType.SELL.val ||
        t === Enum.EnumTradeType.DIVIDEND.val
      );
    },
    isBuyDisabled() {
      return this.form.tradeType !== Enum.EnumTradeType.BUY.val;
    },
    isSellDisabled() {
      return this.form.tradeType !== Enum.EnumTradeType.SELL.val;
    },
    isDividendDisabled() {
      return this.form.tradeType !== Enum.EnumTradeType.DIVIDEND.val;
    },
    // --- Backward-compat aliases for old template props ---
    // Some compiled templates may still reference these names during HMR.
    // Map them to the new computed props to avoid warnings.
    dBasicPrice() {
      return this.isBasicPriceDisabled;
    },
    dNoItem() {
      return this.isNoItemDisabled;
    },
    dBuy() {
      return this.isBuyDisabled;
    },
    dSell() {
      return this.isSellDisabled;
    },
    dDividend() {
      return this.isDividendDisabled;
    },
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
        noItem: 0,
        date: new Date(),

        buy: 0,
        sell: 0,
        dividend: 0,

        trustBalanceId: "",
        accountId: "",
      },

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
    onChangeBasicPriceNoItem: function () {
      if (this.form.tradeType == Enum.EnumTradeType.BUY.val) {
        this.form.buy = this.form.basicPrice * this.form.noItem;
        this.form.sell = 0;
        this.form.dividend = 0;
      } else if (this.form.tradeType == Enum.EnumTradeType.SELL.val) {
        this.form.sell = this.form.basicPrice * this.form.noItem;
        this.form.buy = 0;
        this.form.dividend = 0;
      } else if (this.form.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
        this.form.dividend = this.form.basicPrice * this.form.noItem;
        this.form.buy = 0;
        this.form.sell = 0;
      }
    },

    async submitCreate() {
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