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
          step="0.01"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">noItem</label>
        <input
          type="number"
          class="form-control"
          v-model="form.noItem"
          step="0.01"
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">basicPrice</label>
        <input
          type="number"
          class="form-control"
          v-model="form.basicPrice"
          step="0.01"
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

//import { getTrustBalance } from "../../graphql/queries";
//import { updateTrustBalance } from "../../graphql/mutations";

//import Datepicker from "vue3-datepicker";

//import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "TrustBalanceEdit",
  components: {
    //    Datepicker,
  },
  props: {
    TrustBalanceId: String,
  },
  async created() {
    //console.log(this.props.trustbalanceId);
    //console.log(this.trustbalanceId);

    this.getTrustBalance();
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
      //TrustBalanceId: 0,
    };
  },
  methods: {
    async getTrustBalance() {
      //console.log("-----1");
      //console.log(this.TrustBalanceId);
      await API.graphql({
        query: getTrustBalance,
        variables: { id: this.TrustBalanceId },
      })
        .then((result) => {
          //console.log(result);
          //this.form.id = result.data.getTrustBalance.id;
          //this.form.name = result.data.getTrustBalance.name;
          this.form = result.data.getTrustBalance;

          //console.log(moment(d).format("YYYY/MM/DD"));
          //this.form.date = moment(d).format("YYYY/MM/DD");

          //this.form.date = "2021/01/01";
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async submitUpdate() {
      delete this.form.createdAt;
      delete this.form.updatedAt;
      delete this.form.owner;

      //this.form.date = moment(this.form.date).format("YYYY/MM/DD");
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