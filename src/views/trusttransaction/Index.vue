<template>
  <div>
    <h1>TrustTransactions</h1>

    <router-link to="/trusttransactions/create">TrustTransaction add</router-link>

date
  tradeType
  basicPrice
  basicPriceForeign
  noItem

  buyValueJPY
  buyValueForeign
  sellValueJPY
  sellValueForeign
  dividendValueJPY
  dividendValueForeign


    <table class="table table-striped">
      <thead>
        <tr>
          <th>          date</th>
            <th>tradeType</th>
            <th>basicPrice</th>
            <th>basicPriceForeign</th>
            <th>noItem</th>
            <th>buyValueJPY</th>
            <th>buyValueForeign</th>
            <th>sellValueJPY</th>
            <th>sellValueForeign</th>
            <th>dividendValueJPY</th>
            <th>dividendValueForeign</th>
  
          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(trusttransaction, index) in trusttransactions" :key="trusttransaction.id">

          <td>{{ trusttransaction.date }}</td>
            <td>{{ trusttransaction.tradeType }}</td>
            <td>{{ trusttransaction.basicPrice }}</td>
            <td>{{ trusttransaction.basicPriceForeign }}</td>
            <td>{{ trusttransaction.noItem }}</td>

            <td>{{ trusttransaction.buyValueJPY }}</td>
            <td>{{ trusttransaction.buyValueForeign }}</td>
            <td>{{ trusttransaction.sellValueJPY }}</td>
            <td>{{ trusttransaction.sellValueForeign }}</td>
            <td>{{ trusttransaction.dividendValueJPY }}</td>
            <td>{{ trusttransaction.dividendValueForeign }}</td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'TrustTransactionShow', params: { trusttransactionId: trusttransaction.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Show</button>
            </router-link>
          </td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'TrustTransactionEdit', params: { trusttransactionId: trusttransaction.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Edit</button>
            </router-link>
          </td>
          <td>
            <button
              class="btn btn-primary"
              @click="deleteTrustTransaction(index, trusttransaction.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  
    <router-link custom v-slot="{ navigate }" :to="{ name: 'TrustTransactionCreate' }">
      <button class="btn btn-primary" @click="navigate">Add TrustTransaction</button>
    </router-link>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listTrustTransactions } from "../../graphql/queries";
import { deleteTrustTransaction } from "../../graphql/mutations";

import moment from "moment";

export default {
  name: "TrustTransactionIndex",
  async created() {
    //this.getTrustTransactions();
    this.getTrustTransactions();
  },
  data() {
    return {
      //albums: [],
      trusttransactions: [],
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    async getTrustTransactions() {
      await API.graphql({
        query: listTrustTransactions,
      })
        .then((result) => {
          console.log(result);
          this.trusttransactions = result.data.listTrustTransactions.items;
          //this.TrustTransactions = result.data.listTrustTransactions.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async deleteTrustTransaction(index, trusttransactionId) {
      if (!confirm("Delete TrustTransaction?")) return;

      await API.graphql({
        //query: deleteTrustTransaction,
        query: deleteTrustTransaction,
        variables: { input: { id: trusttransactionId } },
      })
        .then((result) => {
          console.log(result);
          this.trusttransactionss.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>