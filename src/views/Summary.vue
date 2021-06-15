<template>
  <div>
    <h1>Summary</h1>

        <b-col sm="12" class="mb-5">
          <b-button variant="success" v-on:click="getData">表示</b-button>
          <hr />
        </b-col>




    <router-link :to="{ name: 'DepositCreate' }">
      <button class="btn btn-primary">Add Deposit</button>
    </router-link>

    <router-link custom v-slot="{ navigate }" :to="{ name: 'DepositCreate' }">
      <button class="btn btn-primary" @click="navigate">Add Deposit</button>
    </router-link>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listDeposits } from "../graphql/queries";
import { deleteDeposit } from "../graphql/mutations";

//import { listDeposits } from "../../graphql/queries";
//import { deleteDeposit } from "../../graphql/mutations";

import moment from "moment";

export default {
  name: "DepositIndex",
  async created() {
    //this.getDeposits();
    this.getDeposits();
  },
  data() {
    return {
      //albums: [],
      deposits: [],

      apiName: "apif8da427c",

      path: "/summary",
      id: "",
      name: "",
      text: "",


    };
  },
  methods: {
    getData: function () {
      // 検索ID指定
      const path = this.path + "/" + this.text;
      // オプション
      const myInit = {
        headers: {},
        response: true,
      };
      // データ取得
      API.get(this.apiName, path, myInit)
        .then((response) => {
          console.log(response);

          // テーブル表示
          this.items = [
            {
              id: response.data[0].id,
              name: response.data[0].name,
            },
          ];
        });
        //.catch((error) => {
          // テーブルリセット
        //  this.items = [];
        //});
    },

    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    async getDeposits() {
      await API.graphql({
        query: listDeposits,
      })
        .then((result) => {
          console.log(result);
          this.deposits = result.data.listDeposits.items;
          //this.Deposits = result.data.listDeposits.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async deleteDeposit(index, depositId) {
      if (!confirm("Delete Deposit?")) return;

      await API.graphql({
        //query: deleteDeposit,
        query: deleteDeposit,
        variables: { input: { id: depositId } },
      })
        .then((result) => {
          console.log(result);
          this.depositss.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>