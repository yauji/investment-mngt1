<template>
  <div>
    <h1>TrustBalances</h1>

    <router-link to="/trustbalances/create"
      >TrustBalance add</router-link
    >

    <table class="table table-striped">
      <thead>
        <tr>
          <th>date</th>
          <th>trade Type</th>
          <th>basic Price</th>
          <th>basic Price Foreign</th>
          <th>no Item</th>
          <th>buy JPY</th>
          <th>buy Foreign</th>
          <th>sell JPY</th>
          <th>sell Foreign</th>
          <th>dividend JPY</th>
          <th>dividend Foreign</th>

          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(trustbalance, index) in trustbalances"
          :key="trustbalance.id"
        >
          <td>{{ moment(trustbalance.date) }}</td>
          <td>{{ trustbalance.tradeType }}</td>
          <td>{{ trustbalance.basicPrice }}</td>
          <td>{{ trustbalance.basicPriceForeign }}</td>
          <td>{{ trustbalance.noItem }}</td>

          <td>{{ trustbalance.buyJPY }}</td>
          <td>{{ trustbalance.buyForeign }}</td>
          <td>{{ trustbalance.sellJPY }}</td>
          <td>{{ trustbalance.sellForeign }}</td>
          <td>{{ trustbalance.dividendJPY }}</td>
          <td>{{ trustbalance.dividendForeign }}</td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{
                name: 'TrustBalanceShow',
                params: { TrustBalanceId: trustbalance.id },
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
                name: 'TrustBalanceEdit',
                params: { trustbalanceId: trustbalance.id },
              }"
            >
              <button class="btn btn-primary" @click="navigate">Edit</button>
            </router-link>
          </td>
          <td>
            <button
              class="btn btn-primary"
              @click="deleteTrustBalance(index, trustbalance.id)"
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
      :to="{ name: 'TrustBalanceCreate' }"
    >
      <button class="btn btn-primary" @click="navigate">
        Add TrustBalance
      </button>
    </router-link>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listTrustBalances } from "../../graphql/queries";
import { deleteTrustBalance } from "../../graphql/mutations";

import moment from "moment";

export default {
  name: "TrustBalanceIndex",
  async created() {
    //this.getTrustBalances();
    this.getTrustBalances();
  },
  data() {
    return {
      //albums: [],
      trustbalances: [],
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    async getTrustBalances() {
      await API.graphql({
        query: listTrustBalances,
      })
        .then((result) => {
          console.log(result);
          this.trustbalances = result.data.listTrustBalances.items;
          //this.TrustBalances = result.data.listTrustBalances.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async deleteTrustBalance(index, trustbalanceId) {
      if (!confirm("Delete TrustBalance?")) return;

      await API.graphql({
        //query: deleteTrustBalance,
        query: deleteTrustBalance,
        variables: { input: { id: trustbalanceId } },
      })
        .then((result) => {
          console.log(result);
          this.trustbalancess.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>