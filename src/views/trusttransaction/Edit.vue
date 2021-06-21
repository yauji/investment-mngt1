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
          //console.log(result);
          //this.form.id = result.data.getTrustTransaction.id;
          //this.form.name = result.data.getTrustTransaction.name;
          this.form = result.data.getTrustTransaction;
          const d = new Date(result.data.getTrustTransaction.date);
          //console.log(moment(d).format("YYYY/MM/DD"));
          //this.form.date = moment(d).format("YYYY/MM/DD");
          this.form.date = d;
          //this.form.date = "2021/01/01";
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
      delete this.form.createdAt;
      delete this.form.updatedAt;
      delete this.form.owner;

      delete this.form.trustBalance;
      delete this.form.account;

      //this.form.date = moment(this.form.date).format("YYYY/MM/DD");
      await API.graphql({
        query: updateTrustTransaction,
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