<template>
  <div>
    <h1>Edit account</h1>

    <form @submit.prevent="submitUpdate">
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
          <label for="" class="form-label">exchange rate</label>
          <input
            type="number"
            class="form-control"
            v-model="form.exchangeRate"
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
        //id: "",
        //        date: new Date(),
        //      endDate: new Date(),
      },
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
    },
    async getAccount() {
      //console.log(this.accountId);

      await API.graphql({
        query: getAccount,
        variables: { id: this.accountId },
      })
        .then((result) => {
          this.form = result.data.getAccount;          
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async submitUpdate() {
      delete this.form.createdAt;
      delete this.form.updatedAt;
      delete this.form.owner;

      await API.graphql({
        query: updateAccount,
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