<template>
  <div>
    <h1>Edit account</h1>

    <form @submit.prevent="submitUpdate">
      <div class="mb-3">
        <div class="mb-3">
          <label for="" class="form-label">name</label>
          <input
            type="text"
            class="form-control"
            v-model="form.name"
            required
          />
        </div>

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
          <label for="" class="form-label">exchange rate</label>
          <input
            type="number"
            class="form-control"
            v-model="form.exchangeRate"
            step="0.01"
          />
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
import { getAccount } from "../../graphql/queries";
import { updateAccount } from "../../graphql/mutations";

//import Datepicker from "vue3-datepicker";

import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "AccountEdit",
  components: {
    //Datepicker,
  },
  props: {
    accountId: String,
  },
  async created() {
    //console.log(this.props.accountId);
    //console.log(this.accountId);

    this.getAccount();
  },
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      form: {
        id: this.accountId,
        name: '',
        currency: "JPY",
        exchangeRate: 0,
        memo: "",
      },
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
    },
    async getAccount() {
      await API.graphql({
        query: getAccount,
        variables: { id: this.accountId },
      })
        .then((result) => {
          const a = result.data.getAccount;
          // keep only editable fields to avoid GraphQL input validation errors
          this.form = {
            id: a.id,
            name: a.name ?? '',
            currency: a.currency,
            exchangeRate: a.exchangeRate ?? 0,
            memo: a.memo ?? "",
          };
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async submitUpdate() {
      try {
        // sanitize input: keep only allowed properties
        const input = {
          id: this.form.id,
          name: this.form.name ?? '',
          currency: this.form.currency,
          exchangeRate: Number(this.form.exchangeRate || 0),
          memo: this.form.memo ?? "",
        };

        const result = await API.graphql({
          query: updateAccount,
          variables: { input },
        });
        console.log(result);
        this.$router.push({ name: "AccountIndex" });
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>
