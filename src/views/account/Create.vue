<template>
  <div>
    <h1>New Account</h1>

    <form @submit.prevent="submitCreate">
      <input type="submit" value="Submit" />

      <div class="mb-3">
        <div class="mb-3">
          <label for="" class="form-label">currency</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.currency"
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
          <label for="" class="form-label">memo</label>
          <textarea class="form-control" v-model="form.memo" />
        </div>

        <button type="submit" class="btn btn-primary">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { createAccount } from "../../graphql/mutations";

import * as Enum from "@/Enum";

export default {
  name: "AccountCreate",

  components: {},
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      form: {
        currency: "",
        memo: "",
      },
    };
  },
  methods: {
    async submitCreate() {
      this.form.balance = 0;
      this.form.exchangeRate = 0;

      await API.graphql({
        query: createAccount,
        variables: { input: this.form },
      })
        .then((result) => {
          console.log(result);
          this.$router.push({ name: "AccountIndex" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>