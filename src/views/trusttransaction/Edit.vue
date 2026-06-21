<template>
  <div>
    <h1>Edit trusttransaction</h1>

    <form @submit.prevent="submitUpdate">
      <input type="submit" value="Submit" />

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
          step="0.000001"
          class="form-control"
          v-model="form.basicPrice"
          v-bind:disabled="dBasicPrice"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">noItem</label>
        <input
          type="number"
          step="any"
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

import { updateTrustTransaction } from "../../graphql/mutations";
import {
  getTrustTransaction,
  listTrustBalances,
  listAccounts,
} from "../../graphql/queries";

//import Datepicker from "vue3-datepicker";

import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "TrustTransactionEdit",
  components: {
    //Datepicker,
  },
  props: {
    trustTransactionId: String,
  },
  async created() {
    //console.log(this.props.trusttransactionId);
    //console.log(this.trusttransactionId);
    this.getTrustBalances();
    this.getAccounts();

    this.getTrustTransaction();
  },
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      form: {
        //id: "",
        //        date: new Date(),
        //      endDate: new Date(),
      },
      trustbalances: [],
      accounts: [],
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
    },
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
    async getTrustTransaction() {
      //console.log(this.trusttransactionId);

      await API.graphql({
        query: getTrustTransaction,
        variables: { id: this.trustTransactionId },
      })
        .then((result) => {
          const tt = result.data.getTrustTransaction;
          // build sanitized form (avoid GraphQL metadata like __typename and nested objects)
          this.form = {
            id: tt.id,
            date: new Date(tt.date),
            tradeType: tt.tradeType,
            basicPrice: tt.basicPrice,
            noItem: tt.noItem,
            buy: tt.buy,
            sell: tt.sell,
            dividend: tt.dividend,
            trustBalanceId: tt.trustBalanceId,
            accountId: tt.accountId,
          };
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
    async submitUpdate() {
      // Build strict input payload for UpdateTrustTransactionInput
      const input = {
        id: this.form.id,
        date: this.form.date ? new Date(this.form.date).toISOString() : null,
        tradeType: this.form.tradeType,
        basicPrice: this.form.basicPrice != null ? Number(this.form.basicPrice) : null,
        noItem: this.form.noItem != null ? Number(this.form.noItem) : null,
        buy: this.form.buy != null ? Number(this.form.buy) : null,
        sell: this.form.sell != null ? Number(this.form.sell) : null,
        dividend: this.form.dividend != null ? Number(this.form.dividend) : null,
        trustBalanceId: this.form.trustBalanceId,
        accountId: this.form.accountId,
      };

      // Remove nulls to avoid sending undefined fields
      Object.keys(input).forEach((k) => input[k] === null && delete input[k]);

      // Normalize quantity sign: SELL saves negative, others non-negative
      if (input.noItem !== undefined) {
        const qty = Math.abs(Number(input.noItem) || 0);
        if (input.tradeType === Enum.EnumTradeType.SELL.val) {
          input.noItem = -qty;
        } else {
          input.noItem = qty;
        }
      }

      await API.graphql({
        query: updateTrustTransaction,
        variables: { input },
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
