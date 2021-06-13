<template>
  <div>
    <h1>New Deposit</h1>
    <form @submit.prevent="submitCreate">
      <label>Name</label><br />
      <input v-model="form.name" placeholder="Enter album name" /><br />
      <input type="submit" value="Submit" />
    </form>

<form>
  <div class="mb-3">
    <label for="exampleInputEmail1" class="form-label">Email address</label>
    <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
    <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
  </div>
  <div class="mb-3">
    <label for="exampleInputPassword1" class="form-label">Password</label>
    <input type="password" class="form-control" id="exampleInputPassword1">
  </div>
  <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck1">
    <label class="form-check-label" for="exampleCheck1">Check me out</label>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>  

  </div>

</template>

<script>
import { API } from "aws-amplify";
import { createAlbum } from "../../graphql/mutations";

export default {
  name: "AlbumCreate",
  data() {
    return {
      form: {
        name: "",
        date:"",
        principalCurrency: "",
      },
    };
  },
  methods: {
    async submitCreate() {

      let d = new Date();
      console.log(d.toISOString());
      this.form.date = d.toISOString();

      this.form.principalCurrency = "AUD";

      await API.graphql({
        query: createAlbum,
        variables: { input: this.form },
      })
        .then((result) => {
          console.log(result);
          this.$router.push({ name: "AlbumIndex" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>