<template>
  <div>
    <h1>Finish deposit</h1>

    <form @submit.prevent="submitUpdate">
      <input type="submit" value="Submit" />

      <div class="mb-3">
        <div class="mb-3">
          <label for="" class="form-label">name *</label>
          <input
            type="text"
            class="form-control"
            v-model="form.name"
            required
            disabled
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">memo</label>
          <textarea class="form-control" v-model="form.memo" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">date</label>
          <datepicker v-model="form.date" class="form-control" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">principalCurrency</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.principalCurrency"
            disabled
          >
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
            <option value="AUD">AUD</option>
            <option value="EUR">EUR</option>
            <option value="NZD">NZD</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label">Principal JPY</label>
          <input
            type="number"
            class="form-control"
            v-model="form.principalJPY"
            disabled
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">Principal Foreign</label>
          <input
            type="number"
            step="0.01"
            class="form-control"
            v-model="form.principalForeign"
            disabled
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">exchange rate</label>
          <input
            type="number"
            class="form-control"
            v-model="form.exchangeRate"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">interest rate</label>
          <input
            type="number"
            class="form-control"
            v-model="form.interestRate"
            step="0.01"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">duration</label>
          <input type="text" class="form-control" v-model="form.duration" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">end date *</label>
          <datepicker v-model="form.endDate" class="form-control" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">valueCurrency</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.valueCurrency"
          >
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
            <option value="AUD">AUD</option>
            <option value="EUR">EUR</option>
            <option value="NZD">NZD</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label">value JPY</label>
          <input type="text" class="form-control" v-model="form.valueJPY" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">value foreign</label>
          <input type="text" class="form-control" v-model="form.valueForeign" />
        </div>

        <button type="submit" class="btn btn-primary">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { getDeposit } from "../../graphql/queries";
import { updateDeposit } from "../../graphql/mutations";

import Datepicker from "vue3-datepicker";

import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "DepositFinish",
  components: {
    Datepicker,
  },
  props: {
    depositId: String,
  },
  async created() {
    this.getDeposit();
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
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
    },
    async getDeposit() {
      //console.log(this.depositId);

      await API.graphql({
        query: getDeposit,
        variables: { id: this.depositId },
      })
        .then((result) => {
          this.form = result.data.getDeposit;
          const d = new Date(result.data.getDeposit.date);
          this.form.date = d;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async submitUpdate() {
      delete this.form.createdAt;
      delete this.form.updatedAt;
      delete this.form.owner;

      this.form.status = Enum.EnumDepositStatus.FINISHED.val;

      //this.form.date = moment(this.form.date).format("YYYY/MM/DD");
      await API.graphql({
        query: updateDeposit,
        variables: { input: this.form },
      })
        .then((result) => {
          console.log(result);
          this.$router.push({ name: "DepositIndex" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>