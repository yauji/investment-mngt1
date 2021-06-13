<template>
  <div>
    <h1>New Deposit</h1>

    <form @submit.prevent="submitCreate">
      <input type="submit" value="Submit" />

      <div class="mb-3">
        <div class="mb-3">
          <label for="" class="form-label">name *</label>
          <input type="text" class="form-control" v-model="form.name" required />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">memo</label>
          <textarea class="form-control" v-model="form.memo" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label"></label>
          <input type="text" class="form-control" v-model="form.date" />
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
            <option value="JPY" selected>JPY</option>
            <option value="USD">USD</option>
            <option value="AUD">AUD</option>
            <option value="EUR">EUR</option>
            <option value="NZD">NZD</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label"></label>
          <input type="text" class="form-control" v-model="form.duration" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label"></label>
          <input type="text" class="form-control" v-model="form.xx" />
        </div>



        <label for="exampleInputEmail1" class="form-label">Email address</label>
        <input
          type="email"
          class="form-control"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
        />
        <div id="emailHelp" class="form-text">
          We'll never share your email with anyone else.
        </div>
      </div>
      <div class="mb-3">
        <label for="exampleInputPassword1" class="form-label">Password</label>
        <input
          type="password"
          class="form-control"
          id="exampleInputPassword1"
        />
      </div>
      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="exampleCheck1" />
        <label class="form-check-label" for="exampleCheck1">Check me out</label>
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>

  
</template>

<script>
import { API } from "aws-amplify";
import { createDeposit } from "../../graphql/mutations";

export default {
  name: "DepositCreate",
  data() {
    return {
      form: {
        name: "",
        memo: "",
        status: "",

        date: "",
        principalCurrency: "",
        principalJPY: 0,
        principalForeign: 0,
        exchangeRate: 0,
        interestRate: 0,
        duration: 0,

        endDate: "",
        valueCurrency: "JPY",
        valueJPY: 0,
        valueForeign: 0,
      },
    };
  },
  methods: {
    async submitCreate() {

      this.form.status = "ACTIVE";

this.form.duration = 12;



      let d = new Date();
      console.log(d.toISOString());
      this.form.date = d.toISOString();

      this.form.principalCurrency = "AUD";

      console.log(this.form);

      await API.graphql({
        query: createDeposit,
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