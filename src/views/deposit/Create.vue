<template>
  <div>
    <h1>New Deposit</h1>
    <form @submit.prevent="submitCreate">
      <label>Name</label><br />
      <input v-model="form.name" placeholder="Enter album name" /><br />
      <input type="submit" value="Submit" />
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