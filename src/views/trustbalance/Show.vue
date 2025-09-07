<template>
  <div>
    <h1>Trust Balance</h1>

    <div v-if="loadingTB">Loading...</div>
    <div v-else>
      <div class="mb-3">
        <div><b>name:</b> {{ trustbalance.name }}</div>
        <div><b>currency:</b> {{ trustbalance.currency }}</div>
        <div><b>type:</b> {{ trustbalance.type || '-' }}</div>
        <div><b>code:</b> {{ trustbalance.code || '-' }}</div>
        <div><b>memo:</b> {{ trustbalance.memo || '-' }}</div>
        <div><b>noItem:</b> {{ numberFormat(trustbalance.noItem) }}</div>
        <div><b>basicPrice:</b> {{ trustbalance.basicPrice }}</div>
        <div><b>平均取得価格:</b> {{ numberFormat(trustbalance.averagePurchasePrice) }}</div>
        <div><b>balance:</b> {{ numberFormat(trustbalance.balance) }}</div>
      </div>

      <h2>Transactions</h2>
      <div v-if="loadingTX">Loading transactions...</div>
      <table v-else class="table table-striped">
        <thead>
          <tr>
            <th>date</th>
            <th>tradeType</th>
            <th>basicPrice</th>
            <th>noItem</th>
            <th>buy</th>
            <th>sell</th>
            <th>dividend</th>
            <th>account</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in transactions" :key="t.id">
            <td>{{ moment(t.date) }}</td>
            <td>{{ t.tradeType }}</td>
            <td>{{ t.basicPrice }}</td>
            <td>{{ numberFormat(t.noItem) }}</td>
            <td>{{ numberFormat(t.buy) }}</td>
            <td>{{ numberFormat(t.sell) }}</td>
            <td>{{ numberFormat(t.dividend) }}</td>
            <td>{{ t.account?.name || t.accountId }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  </template>

<script>
import { API } from "aws-amplify";
import { getTrustBalance, listTrustTransactions } from "../../graphql/queries";
import moment from "moment";

export default {
  name: "TrustBalanceShow",
  props: {
    TrustBalanceId: String,
  },
  async created() {
    await this.fetchTrustBalance();
    await this.fetchTransactions();
  },
  data() {
    return {
      trustbalance: {},
      transactions: [],
      loadingTB: false,
      loadingTX: false,
    };
  },
  methods: {
    moment: function (date) {
      if (!date) return "";
      return moment(date).format("YYYY/MM/DD");
    },
    numberFormat: function (value) {
      if (value == null || value === "") return "-";
      const n = Number(value);
      return Number.isNaN(n) ? value : n.toLocaleString();
    },
    async fetchTrustBalance() {
      try {
        this.loadingTB = true;
        const res = await API.graphql({
          query: getTrustBalance,
          variables: { id: this.TrustBalanceId },
        });
        this.trustbalance = res?.data?.getTrustBalance || {};
      } catch (e) {
        console.log(e);
      } finally {
        this.loadingTB = false;
      }
    },
    async fetchTransactions() {
      try {
        this.loadingTX = true;
        const all = [];
        let nextToken = null;
        do {
          const res = await API.graphql({
            query: listTrustTransactions,
            variables: {
              filter: { trustBalanceId: { eq: this.TrustBalanceId } },
              limit: 100,
              nextToken,
            },
          });
          const data = res?.data?.listTrustTransactions;
          if (data?.items?.length) all.push(...data.items);
          nextToken = data?.nextToken || null;
        } while (nextToken);
        // 最新が上に来るように降順ソート
        all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.transactions = all;
      } catch (e) {
        console.log(e);
      } finally {
        this.loadingTX = false;
      }
    },
  },
};
</script>
