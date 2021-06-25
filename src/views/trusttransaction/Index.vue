<template>
  <div>
    <h1>TrustTransactions</h1>


    <table class="table table-striped">
      <thead>
        <tr>
          <th>date</th>
          <th>trade Type</th>
          <th>trust balance</th>
          <th>account</th>
          <th>basic Price</th>
          <th>no Item</th>
          <th>buy</th>
          <th>sell</th>
          <th>dividend</th>

          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(trusttransaction, index) in trusttransactions"
          :key="trusttransaction.id"
        >
          <td>{{ moment(trusttransaction.date) }}</td>
          <td>{{ trusttransaction.tradeType }}</td>
          <td>{{ trusttransaction.trustBalance.name }}</td>
          <td>{{ trusttransaction.account.currency }} {{trusttransaction.account.name}}</td>
          <td>{{ trusttransaction.basicPrice }}</td>
          <td>{{ trusttransaction.noItem }}</td>

          <td>{{ trusttransaction.buy }}</td>
          <td>{{ trusttransaction.sell }}</td>
          <td>{{ trusttransaction.dividend }}</td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{
                name: 'TrustTransactionShow',
                params: { trustTransactionId: trusttransaction.id },
              }"
            >
              <button class="btn btn-primary" @click="navigate">Show</button>
            </router-link>
          </td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{
                name: 'TrustTransactionEdit',
                params: { trustTransactionId: trusttransaction.id },
              }"
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

    <router-link
      custom
      v-slot="{ navigate }"
      :to="{ name: 'TrustTransactionCreate' }"
    >
      <button class="btn btn-primary" @click="navigate">
        Add TrustTransaction
      </button>
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
          this.trusttransactions.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>