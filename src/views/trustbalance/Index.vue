<template>
  <div>
    <h1>Trust Balances</h1>


    <table class="table table-striped">
      <thead>
        <tr>
          <th>currency</th>
          <th>name</th>
          <th>memo</th>
          <th>type</th>
          <th>code</th>
          <th>noItem</th>
          <th>basic price</th>
          <th>平均取得価格</th>
          <th>balance</th>

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
          <td>{{ trustbalance.type }}</td>
          <td>{{ trustbalance.code }}</td>
          <td>{{ numberFormat(trustbalance.noItem) }}</td>
          <td>{{ trustbalance.basicPrice }}</td>
          <td>{{ numberFormat(trustbalance.averagePurchasePrice) }}</td>
          <td>{{ numberFormat(trustbalance.balance) }}</td>

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
    {{ statusUpdate }}

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
    <div>
      Trust balanceのbasicpriceは最新の基準価格。
    </div>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import {
  listTrustBalances,
  listTrustTransactions,
} from "../../graphql/queries";
import {
  deleteTrustBalance,
  updateTrustBalance,
} from "../../graphql/mutations";

import moment from "moment";
import * as Enum from "@/Enum";

export default {
  name: "TrustBalanceIndex",
  async created() {
    this.getTrustBalances();
  },
  data() {
    return {
      trustbalances: [],
      statusUpdate: "",
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
    },
    numberFormat: function (value) {
      if (value == null) {
        return "---";
      } else {
        return value.toLocaleString();
      }
    },
    async getTrustBalances() {
      await API.graphql({
        query: listTrustBalances,
      })
        .then((result) => {
          console.log(result);
          this.trustbalances = result.data.listTrustBalances.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async deleteTrustBalance(index, trustbalanceId) {
      if (!confirm("Delete TrustBalance?")) return;

      await API.graphql({
        query: deleteTrustBalance,
        variables: { input: { id: trustbalanceId } },
      })
        .then((result) => {
          console.log(result);
          this.trustbalances.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async fetchAllTrustTransactions() {
      const all = [];
      let nextToken = null;
      do {
        const res = await API.graphql({
          query: listTrustTransactions,
          variables: nextToken ? { nextToken } : {},
        });
        const data = res.data?.listTrustTransactions;
        if (data?.items?.length) {
          all.push(...data.items);
        }
        nextToken = data?.nextToken || null;
      } while (nextToken);
      return all;
    },
    async updateBalances() {
      this.statusUpdate = "updating...";
      try {
        // 1) 全取引をページングで取得
        const trusttransactions = await this.fetchAllTrustTransactions();

        // 2) trustBalanceId ごとにグループ化し、日付昇順でソート
        const byTB = new Map();
        const parseDate = (s) => (s ? new Date(s).getTime() : 0);
        for (const t of trusttransactions) {
          if (!t?.trustBalanceId) continue;
          if (!byTB.has(t.trustBalanceId)) byTB.set(t.trustBalanceId, []);
          byTB.get(t.trustBalanceId).push(t);
        }
        for (const arr of byTB.values()) {
          arr.sort((a, b) => parseDate(a.date) - parseDate(b.date));
        }

        // 3) 各TBについて、口数(noItem)と平均取得価格(averagePurchasePrice)を算出
        /** @type {Record<string, {units:number, avg:number}>} */
        const agg = {};
        for (const tb of this.trustbalances) {
          agg[tb.id] = { units: 0, avg: 0 };
        }

        for (const [tbid, arr] of byTB.entries()) {
          let units = 0;
          let cost  = 0;  // avg * units
          let avg   = 0;
          for (const t of arr) {
            const qty = Number(t.noItem) || 0;
            const price = Number(t.basicPrice) || 0;
            const kind = t.tradeType;
            if (kind === Enum.EnumTradeType.BUY.val || kind === 'BUY') {
              if (qty > 0 && price > 0) {
                cost  += price * qty;
                units += qty;
                avg = units > 0 ? cost / units : 0;
              }
            } else if (kind === Enum.EnumTradeType.SELL.val || kind === 'SELL') {
              if (qty > 0) {
                units = Math.max(0, units - qty);
                if (units === 0) {
                  cost = 0;
                  avg  = 0;
                } else {
                  cost = avg * units; // 平均は維持
                }
              }
            } else {
              // DIVIDEND 等は平均と口数に影響させない（必要ならここで加味）
            }
          }
          agg[tbid] = { units, avg };
        }

        // 4) DB更新（最小フィールドのみ送信: id, noItem, balance, averagePurchasePrice）
        for (const tb of this.trustbalances) {
          const units = Number(agg[tb.id]?.units ?? 0) || 0;
          const avg   = Number(agg[tb.id]?.avg ?? 0) || 0;
          const basic = Number(tb.basicPrice) || 0;
          const input = {
            id: tb.id,
            noItem: units,
            balance: units * basic,
            averagePurchasePrice: avg,
          };
          await API.graphql({
            query: updateTrustBalance,
            variables: { input },
          });
        }

        // 5) DBの最新値でUI更新
        await this.getTrustBalances();
        this.statusUpdate = "done.";
      } catch (error) {
        console.log(error);
        this.statusUpdate = "error.";
      }
    },
  },
};
</script>