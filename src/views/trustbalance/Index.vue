<template>
  <div>
    <h1>TrustBalances</h1>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>currency</th>
          <th>name</th>
          <th>memo</th>
          <th>balance</th>
          <th>noItem</th>
          <th>basicPrice</th>

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
          <td>{{ trustbalance.currency }}</td>
          <td>{{ trustbalance.name }}</td>
          <td>{{ trustbalance.memo }}</td>
          <td>{{ trustbalance.balance }}</td>
          <td>{{ trustbalance.noItem }}</td>
          <td>{{ trustbalance.basicPrice }}</td>

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
                params: { TrustBalanceId: trustbalance.id },
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

    <button class="btn btn-primary" @click="updateBalances()">
      Update balance
    </button>

    <br />
    <br />

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
import {
  listTrustBalances,
  listTrustTransactions,
} from "../../graphql/queries";
//import { deleteTrustBalance } from "../../graphql/mutations";
import {
  deleteTrustBalance,
  updateTrustBalance,
} from "../../graphql/mutations";

import moment from "moment";
import * as Enum from "@/Enum";

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
    async updateBalances() {
      //get trusttransactions-----
      var trusttransactions;
      await API.graphql({
        query: listTrustTransactions,
      })
        .then((result) => {
          //console.log(result);
          trusttransactions = result.data.listTrustTransactions.items;
        })
        .catch((error) => {
          console.log(error);
        });

      console.log(trusttransactions);

      //get trustbalances---
      var trustbalances;
      await API.graphql({
        query: listTrustBalances,
      })
        .then((result) => {
          //console.log(result);
          trustbalances = result.data.listTrustBalances.items;
        })
        .catch((error) => {
          console.log(error);
        });

      //console.log("------4");
      //console.log(trustbalances);
      //console.log(trustbalances.trustTransactions);

      // create dic----
      var dicIdTrustBalance = [];

      for (const a in trustbalances) {
        trustbalances[a].noItem = 0;

        dicIdTrustBalance[trustbalances[a].id] = trustbalances[a];
      }

      console.log("------5");
      console.log(dicIdTrustBalance);

      for (const ktt in trusttransactions) {
        //console.log(trusttransactions[kd]);
        const tt = trusttransactions[ktt];
        console.log(tt);

        if (tt.tradeType == Enum.EnumTradeType.BUY.val) {
          console.log("---51");
          console.log(dicIdTrustBalance[tt.trustBalanceId]);
          dicIdTrustBalance[tt.trustBalanceId].noItem += tt.noItem;
        } else if (tt.tradeType == Enum.EnumTradeType.SELL.val) {
          dicIdTrustBalance[tt.trustBalanceId].noItem -= tt.noItem;
        } else if (tt.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
          //correct?
          dicIdTrustBalance[tt.trustBalanceId].noItem += tt.noItem;
        }
      }
      console.log("------12");
      console.log(dicIdTrustBalance);

      //TODO update balance.

      for (const ka in dicIdTrustBalance) {
        var a = dicIdTrustBalance[ka];
        //a.balance = dicTrustTransactionBalanceEachCurrency[a.currency];
        //console.log(a);

        delete a.createdAt;
        delete a.updatedAt;
        delete a.owner;
        delete a.trustTransactions;

        a.balance = a.noItem * a.basicPrice;

        await API.graphql({
          query: updateTrustBalance,
          variables: { input: a },
        })
          .then((result) => {
            console.log(result);
            //this.$router.push({ name: "TrustBalanceIndex" });
          })
          .catch((error) => {
            console.log(error);
          });
      }

      //hoge
    },
  },
};
</script>