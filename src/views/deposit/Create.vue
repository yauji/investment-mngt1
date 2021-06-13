<template>
  <div>
    <h1>New Deposit</h1>
    <form @submit.prevent="submitCreate2">
      <label>Name</label><br />
      <input v-model="form.name" placeholder="Enter album name" /><br />
      <input type="submit" value="Submit" />
    </form>

    <form @submit.prevent="submitCreate">
      <input type="submit" value="Submit" />

      <div class="mb-3">
        status:DepositeStatus! date:String! principalCurrency:Currency!
        principalJPY: Int principalForeign:Float exchangeRate:Float
        interestRate:Float duration:Int! endDate:String valueCurrency:Currency!
        valueJPY:Int valueForeign:Float

        <div class="mb-3">
          <label for="" class="form-label">name</label>
          <input type="text" class="form-control" v-model="form.name" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">memo</label>
          <input type="text" class="form-control" id="memo" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label"></label>
          <input type="" class="form-control" id="" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label"></label>
          <input type="" class="form-control" id="" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label"></label>
          <input type="" class="form-control" id="" />
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

  name memo status date principalCurrency principalJPY principalForeign
  exchangeRate interestRate duration endDate valueCurrency valueJPY valueForeign
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
        principalJPY: "",
        principalForeign: "",
        exchangeRate: "",
        interestRate: "",
        duration: "",

        endDate: "",
        valueCurrency: "",
        valueJPY: "",
        valueForeign: "",
      },
    };
  },
  methods: {
    async submitCreate() {
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