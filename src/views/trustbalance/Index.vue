<template>
  <div>
    <h1>Trust Balances</h1>


    <table class="table table-striped">
      <thead>
        <tr>
          <th>currency</th>
          <th>name</th>
          <th>memo</th>
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
        // 1) 取引一覧を全ページ取得
        const trusttransactions = await this.fetchAllTrustTransactions();
    
        // 2) ID→口数 集計用の辞書（プレーンオブジェクト）
        /** @type {Record<string, number>} */
        const dicIdTBNoItem = {};
        for (const tb of this.trustbalances) {
          dicIdTBNoItem[tb.id] = 0;
        }
    
        // 3) 取引からnoItemを集計（数値化して加減算）
        for (const tt of trusttransactions) {
          const key = tt.trustBalanceId;
          if (!key) continue;
          const qty = Number(tt.noItem) || 0;
          if (tt.tradeType === Enum.EnumTradeType.BUY.val) {
            dicIdTBNoItem[key] = (dicIdTBNoItem[key] || 0) + qty;
          } else if (tt.tradeType === Enum.EnumTradeType.SELL.val) {
            dicIdTBNoItem[key] = (dicIdTBNoItem[key] || 0) - qty;
          } else if (tt.tradeType === Enum.EnumTradeType.DIVIDEND.val) {
            dicIdTBNoItem[key] = (dicIdTBNoItem[key] || 0) + qty;
          }
        }
    
        // 4) DB更新（最小フィールドのみ送信: id, noItem, balance）
        for (const tb of this.trustbalances) {
          const newNoItem = Number(dicIdTBNoItem[tb.id]) || 0;
          // balanceの計算は現在の平均取得価格を採用（必要に応じてbasicPriceに変更可）
          const avg = Number(tb.basicPrice) || 0;
          const newBalance = newNoItem * avg;
    
          const input = {
            id: tb.id,
            noItem: newNoItem,
            balance: newBalance,
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