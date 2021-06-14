<template>
  <div>
    <h1>Edit deposit</h1>

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
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">memo</label>
          <textarea class="form-control" v-model="form.memo" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">date</label>
          <datepicker v-model="form.date" class="form-control" />
          <!--
          <input text="text" v-model="form.date"/>
             -->
        </div>

        <div class="mb-3">
          <label for="" class="form-label">principalCurrency</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.principalCurrency"
          >
            <!--
            <option selected>Open this select menu</option>-->
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
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">Principal Foreign</label>
          <input
            type="number"
            step="0.01"
            class="form-control"
            v-model="form.principalForeign"
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
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">duration</label>
          <input type="text" class="form-control" v-model="form.duration" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">end date</label>
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

export default {
  name: "DepositEdit",
  components: {
    Datepicker,
  },
  props: {
    depositId: String,
  },
  async created() {
    //console.log(this.props.depositId);
    //console.log(this.depositId);

    this.getDeposit();
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
    async getDeposit() {
      //console.log(this.depositId);

      await API.graphql({
        query: getDeposit,
        variables: { id: this.depositId },
      })
        .then((result) => {
          console.log("xxxxxxxxxx");
          //console.log(result);
          //this.form.id = result.data.getDeposit.id;
          //this.form.name = result.data.getDeposit.name;
          this.form = result.data.getDeposit;
          const d = new Date(result.data.getDeposit.date);
          //console.log(moment(d).format("YYYY/MM/DD"));
          //this.form.date = moment(d).format("YYYY/MM/DD");
          this.form.date = d;
          //this.form.date = "2021/01/01";
          //hoge
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async submitUpdate() {
      //hoge
      //const did = this.form.id;
      
      delete this.form.id;
      delete this.form.createdAt;
      delete this.form.updatedAt;
      delete this.form.owner;

      const f = {
        //id: did,
        name: 'hoge',
      };
      //f.id = did;

      

      console.log(f);
      //this.form.date = moment(this.form.date).format("YYYY/MM/DD");
      await API.graphql({
        query: updateDeposit,
        //id: did,
        //variables: { input: this.form },
        variables: { input: f },
//        variables: { key: did, input: this.form },
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