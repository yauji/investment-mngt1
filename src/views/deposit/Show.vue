<template>
  <div>
    <h1>Deposit</h1>
    <h2>{{ deposit.name }}</h2>


    
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { getDeposit } from "../../graphql/queries";
//import { deletePhoto } from "../../graphql/mutations";

export default {
  name: "DepositShow",
  props: {
    depositId: String,
  },
  async created() {
    this.getDeposit();
  },
  data() {
    return {
      deposit: {
        name: null,
      },
    };
  },
  methods: {
    async getDeposit() {
      await API.graphql({
        query: getDeposit,
        variables: { id: this.depositId },
      })
        .then((result) => {
          console.log(result);
          this.deposit = result.data.getDeposit;
        })
        .catch((error) => {
          console.log(error);
        });
    },
   
  },
};
</script>