<template>
  <div>
    <h1>Edit trustbalance</h1>

    <form @submit.prevent="submitUpdate">
      <div class="mb-3">
        <label for="" class="form-label">currency *</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.currency"
          required
        >
          <option
            v-for="n in refEnum.EnumCurrency"
            v-bind:key="n"
            v-bind:value="n.val"
          >
            {{ n.text }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">name *</label>
        <input type="text" class="form-control" v-model="form.name" required />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">memo</label>
        <textarea class="form-control" v-model="form.memo" />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">balance</label>
        <input
          type="number"
          class="form-control"
          v-model="form.balance"
          step="0.0001"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">noItem</label>
        <input
          type="number"
          class="form-control"
          v-model="form.noItem"
          step="0.0001"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">basicPrice</label>
        <input
          type="number"
          class="form-control"
          v-model="form.basicPrice"
          step="0.0001"
        />
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";

import { getTrustBalance } from "../../graphql/queries";
import { updateTrustBalance } from "../../graphql/mutations";

import * as Enum from "@/Enum";

export default {
  name: "TrustBalanceEdit",
  components: {},
  props: {
    TrustBalanceId: String,
  },
  async created() {
    this.getTrustBalance();
  },
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      form: {},
    };
  },
  methods: {
    async getTrustBalance() {
      await API.graphql({
        query: getTrustBalance,
        variables: { id: this.TrustBalanceId },
      })
        .then((result) => {
          this.form = result.data.getTrustBalance;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async submitUpdate() {
      delete this.form.createdAt;
      delete this.form.updatedAt;
      delete this.form.owner;
      delete this.form.trustTransactions;


      await API.graphql({
        query: updateTrustBalance,
        variables: { input: this.form },
      })
        .then((result) => {
          console.log(result);
          this.$router.push({ name: "TrustBalanceIndex" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>