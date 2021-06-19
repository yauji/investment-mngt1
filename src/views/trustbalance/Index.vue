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
import { listTrustBalances, listTrustTransactions } from "../../graphql/queries";
import { deleteTrustBalance, updateTrustBalance } from "../../graphql/mutations";

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

      //console.log(trusttransactions);

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

      //console.log(trustbalances);

      // create dic----
      var dicTrustTransactionBalanceEachCurrency = [];

      for (const a in trustbalances) {
        dicTrustTransactionBalanceEachCurrency[trustbalances[a].currency] = 0;
      }

      for (const kd in trusttransactions) {
        //console.log(trusttransactions[kd]);
        const d = trusttransactions[kd];
        if (d.status == Enum.EnumTrustTransactionStatus.FINISHED.val) {
          if (
            d.trusttransactionType == Enum.EnumTrustTransactionType.TRUSTTRANSACTION_JPY.val ||
            d.trusttransactionType ==
              Enum.EnumTrustTransactionType.BUY_FOREIGN_CURRENCY_BY_JPY.val
          ) {
            dicTrustTransactionBalanceEachCurrency[d.valueCurrency] += d.valueForeign;
          } else if (
            d.trusttransactionType == Enum.EnumTrustTransactionType.TRUSTTRANSACTION_FC.val ||
            d.trusttransactionType == Enum.EnumTrustTransactionType.BUY_FOREIGN_CURRENCY_BY_FC.val
          ) {
            dicTrustTransactionBalanceEachCurrency[d.valueCurrency] += d.valueForeign;
            dicTrustTransactionBalanceEachCurrency[d.principalCurrency] -=
              d.principlaForeign;
          } else if (
            d.trusttransactionType == Enum.EnumTrustTransactionType.SELL_FOREIGN_CURRENCY.val
          ) {
            dicTrustTransactionBalanceEachCurrency[d.principalCurrency] -=
              d.principlaForeign;
          }
        }
      }

      //console.log("------12");
      //console.log(dicTrustTransactionBalanceEachCurrency);

      for (const ka in trustbalances) {
        var a = trustbalances[ka];
        a.balance = dicTrustTransactionBalanceEachCurrency[a.currency];
        //console.log(a);

        delete a.createdAt;
        delete a.updatedAt;
        delete a.owner;

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