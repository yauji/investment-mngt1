<template>
  <div>
    <h1>Trust Balances</h1>


    <table class="table table-striped">
      <thead>
        <tr>
          <th class="th-small">currency</th>
          <th class="th-small">name</th>
          <th class="th-small">memo</th>
          <th class="th-small">type</th>
          <th class="th-small">code</th>
          <th class="th-small">noItem</th>
          <th class="th-small">basic price</th>
          <th class="th-small">平均取得価格</th>
          <th class="th-pnl">PnL</th>
          <th class="th-small">balance</th>
          <th class="th-small">balance JPY</th>

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
          <td class="td-small">{{ trustbalance.currency }}</td>
          <td class="td-small">
            <router-link
              :to="{ name: 'TrustBalanceShow', params: { TrustBalanceId: trustbalance.id } }"
            >
              {{ trustbalance.name }}
            </router-link>
          </td>
          <td class="td-small">{{ trustbalance.memo }}</td>
          <td class="td-small">{{ trustbalance.type }}</td>
          <td class="td-small">{{ trustbalance.code }}</td>
          <td class="td-small">{{ numberFormat(trustbalance.noItem) }}</td>
          <td class="td-small">{{ trustbalance.basicPrice }}</td>
          <td class="td-small">{{ numberFormat(trustbalance.averagePurchasePrice) }}</td>
          <td :class="pnlClass(plFor(trustbalance))">{{ numberFormat(plFor(trustbalance)) }}</td>
          <td class="td-small">{{ numberFormat(trustbalance.balance) }}</td>
          <td class="td-small">{{ numberFormat((Number(trustbalance.balance) || 0) * rateFor(trustbalance.currency)) }}</td>

          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{
                name: 'TrustBalanceEdit',
                params: { TrustBalanceId: trustbalance.id },
              }"
            >
              <button class="btn btn-outline-primary btn-sm" @click="navigate" title="Edit" aria-label="Edit">
                ✎
              </button>
            </router-link>
          </td>
          <td>
            <button class="btn btn-outline-danger btn-sm" @click="deleteTrustBalance(index, trustbalance.id)" title="Delete" aria-label="Delete">✕</button>
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
import { mapState } from 'vuex';

export default {
  name: "TrustBalanceIndex",
  async created() {
    await this.getTrustBalancesAll();
  },
  data() {
    return {
      trustbalances: [],
      statusUpdate: "",
    };
  },
  computed: {
    ...mapState(['exchangeRates']),
  },
  methods: {
    rateFor(ccy) {
      const c = String(ccy || '').toUpperCase();
      if (c === 'JPY') return 1;
      const rates = (this.$store && this.$store.state && this.$store.state.exchangeRates) ? this.$store.state.exchangeRates : {};
      const v = Number(rates[c]);
      return Number.isFinite(v) && v > 0 ? v : 0;
    },
    plFor(tb) {
      const bp = Number(tb?.basicPrice) || 0;
      const avg = Number(tb?.averagePurchasePrice) || 0;
      const units = Number(tb?.noItem) || 0;
      return (bp - avg) * units;
    },
    pnlClass(value) {
      const v = Number(value) || 0;
      if (v > 0) return 'td-pnl pnl-pos';
      if (v < 0) return 'td-pnl pnl-neg';
      return 'td-pnl pnl-zero';
    },
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
      // Backward compat; keep name but fetch all pages
      return this.getTrustBalancesAll();
    },
    async getTrustBalancesAll() {
      const all = [];
      let nextToken = null;
      try {
        do {
          const res = await API.graphql({
            query: listTrustBalances,
            variables: { limit: 100, nextToken },
          });
          const data = res.data?.listTrustBalances;
          if (data?.items?.length) {
            all.push(...data.items);
          }
          nextToken = data?.nextToken || null;
        } while (nextToken);
        this.trustbalances = all;
      } catch (e) {
        console.log(e);
      }
      return all;
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
      console.log("[updateBalances] start");
      try {
        // 1) 全取引をページングで取得
        const trusttransactions = await this.fetchAllTrustTransactions();
        console.log(`[updateBalances] fetched transactions: ${trusttransactions.length}`);

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
        console.log(`[updateBalances] grouped TB count: ${byTB.size}`);

        // 3) 各TBについて、口数(noItem)と平均取得価格(averagePurchasePrice)を算出
        /** @type {Record<string, {units:number, avg:number}>} */
        const agg = {};
        // TrustBalance 基準価格の参照（単価欠損時のスケール判定用のみ）
        const tbBasicById = Object.fromEntries(this.trustbalances.map(tb => [tb.id, Number(tb.basicPrice) || 0]));
        for (const tb of this.trustbalances) {
          agg[tb.id] = { units: 0, avg: 0 };
        }

        for (const [tbid, arr] of byTB.entries()) {
          console.log(`[updateBalances] TB ${tbid}: ${arr.length} transactions`);
          let units = 0;
          let cost  = 0;  // avg * units
          let avg   = 0;
          let lastPrice = 0; // 参照のみ（basicPriceは更新に使わない）
          for (const t of arr) {
            let qty = Number(t.noItem) || 0;
            const price = Number(t.basicPrice) || 0;
            const kind = t.tradeType;
            if (price > 0) lastPrice = price; // 直近の価格を保持
            // qty が欠損している場合、金額/単価から補完
            if ((!qty || qty <= 0) && price > 0) {
              const buyAmt = Number(t.buy) || 0;
              const sellAmt = Number(t.sell) || 0;
              const before = qty;
              if (kind === Enum.EnumTradeType.BUY.val || kind === 'BUY') {
                if (buyAmt > 0) qty = buyAmt / price;
              } else if (kind === Enum.EnumTradeType.SELL.val || kind === 'SELL') {
                if (sellAmt > 0) qty = sellAmt / price;
              }
              if (qty !== before) {
                console.log(
                  `[updateBalances] supplemented qty TB ${tbid} tx ${t.id}: ${before} -> ${qty} using ${kind} amt/bp = ${(buyAmt||sellAmt)}/${price}`
                );
              }
            }
            // SELL で単価が無い場合、平均単価から数量を推定（最後の手段）
            if ((kind === Enum.EnumTradeType.SELL.val || kind === 'SELL') && (!qty || qty <= 0)) {
              const sellAmt = Number(t.sell) || 0;
              if (sellAmt > 0 && avg > 0) {
                qty = sellAmt / avg;
                console.log(`[updateBalances] inferred qty from avg TB ${tbid} tx ${t.id}: qty=${qty} using sell=${sellAmt} avg=${avg}`);
              }
            }
            // 投信の 1/10000 口表記を自動補正（buy/sell 金額と照合してスケール判定）
            if (qty > 0 && price > 0) {
              const buyAmt = Number(t.buy) || Number(t.sell) || 0;
              const ratio = buyAmt > 0 ? (qty * price) / buyAmt : 1;
              if (ratio > 9000 && ratio < 11000) {
                console.log(`[updateBalances] scale 1/10000 applied TB ${tbid} tx ${t.id}: qty ${qty} -> ${qty/10000}`);
                qty = qty / 10000;
              }
            }
            // 単価が無い場合でも、TB 基準価格と金額から 1/10000 スケールを推定
            if (qty > 0 && price <= 0) {
              const refPrice = tbBasicById[tbid] || 0;
              const amt = Number(t.buy) || Number(t.sell) || 0;
              if (refPrice > 0 && amt > 0) {
                const ratio = (qty * refPrice) / amt;
                if (ratio > 9000 && ratio < 11000) {
                  console.log(`[updateBalances] scale 1/10000 (ref TB basic) TB ${tbid} tx ${t.id}: qty ${qty} -> ${qty/10000}`);
                  qty = qty / 10000;
                }
              }
            }

            if (kind === Enum.EnumTradeType.BUY.val || kind === 'BUY') {
              if (qty > 0 && price > 0) {
                cost  += price * qty;
                units += qty;
                avg = units > 0 ? cost / units : 0;
                console.log(`[updateBalances] BUY TB ${tbid} tx ${t.id}: +${qty} @ ${price} => units=${units}, avg=${avg}`);
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
                console.log(`[updateBalances] SELL TB ${tbid} tx ${t.id}: -${qty} => units=${units}, avg=${avg}`);
              }
            } else {
              // DIVIDEND 等は平均と口数に影響させない（必要ならここで加味）
            }
          }
          agg[tbid] = { units, avg };
          // latestPrice[tbid] = lastPrice; // 基準価格は更新に使わないため保持のみ
          console.log(`[updateBalances] TB ${tbid} result: units=${units}, avg=${avg}, lastPrice=${lastPrice}`);
        }

        // 4) DB更新（対象: 取引が存在するTBのみ。最小フィールド: id, noItem, balance, averagePurchasePrice）
        const tbById = new Map(this.trustbalances.map(tb => [tb.id, tb]));
        for (const [tbid, { units, avg }] of Object.entries(agg)) {
          // 取引が0件の場合も noItem/averagePurchasePrice は 0 に更新する
          const tb = tbById.get(tbid);
          if (!tb) continue;
          // 基準価格はTBの値をそのまま使用（取引からは更新しない）
          const basic = Number(tb.basicPrice) || 0;
          const input = {
            id: tbid,
            noItem: Number(units) || 0,
            balance: (Number(units) || 0) * basic,
            averagePurchasePrice: Number(avg) || 0,
          };
          console.log(`[updateBalances] updating TB ${tbid} with`, input, `(basicPrice kept=${basic})`);
          try {
            const res = await API.graphql({
              query: updateTrustBalance,
              variables: { input },
            });
            console.log(`[updateBalances] updated TB ${tbid}`, res?.data?.updateTrustBalance?.id || "");
          } catch (e) {
            console.error(`[updateBalances] update failed TB ${tbid}`, e);
          }
        }

        // 5) DBの最新値でUI更新
        await this.getTrustBalancesAll();
        this.statusUpdate = "done.";
        console.log("[updateBalances] done");
      } catch (error) {
        console.log(error);
        this.statusUpdate = "error.";
      }
    },
  },
};
</script>

<style scoped>
/* Smaller default cells/headers */
.th-small { font-size: 0.85rem; color: #666; font-weight: 500; }
.td-small { font-size: 0.9rem; color: #555; }

/* Highlight PnL */
.th-pnl { font-size: 0.95rem; font-weight: 700; }
.td-pnl { font-size: 1.05rem; font-weight: 700; }
.td-pnl.pnl-pos { color: #0a8; }
.td-pnl.pnl-neg { color: #d33; }
.td-pnl.pnl-zero { color: #888; }
</style>
