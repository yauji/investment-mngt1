<template>
  <div>
    <h1>Trust Balances</h1>

    <div class="table-scroll">
      <table class="table table-striped table-sticky">
        <thead>
          <tr>
            <th class="th-small th-sort" @click="setSort('currency')">
              currency<span class="sort-indicator">{{ sortIndicator('currency') }}</span>
            </th>
            <th class="th-small th-sort" @click="setSort('name')">
              name<span class="sort-indicator">{{ sortIndicator('name') }}</span>
            </th>
            <th class="th-small th-sort" @click="setSort('memo')">
              memo<span class="sort-indicator">{{ sortIndicator('memo') }}</span>
            </th>
            <th class="th-small th-sort" @click="setSort('type')">
              type<span class="sort-indicator">{{ sortIndicator('type') }}</span>
            </th>
            <th class="th-small th-sort" @click="setSort('code')">
              code<span class="sort-indicator">{{ sortIndicator('code') }}</span>
            </th>
            <th class="th-small th-num th-sort" @click="setSort('noItem')">
              noItem<span class="sort-indicator">{{ sortIndicator('noItem') }}</span>
            </th>
            <th class="th-small th-num th-sort" @click="setSort('basicPrice')">
              basic price<span class="sort-indicator">{{ sortIndicator('basicPrice') }}</span>
            </th>
            <th class="th-small th-num th-sort" @click="setSort('averagePurchasePrice')">
              平均取得価格<span class="sort-indicator">{{ sortIndicator('averagePurchasePrice') }}</span>
            </th>
            <th class="th-small th-num th-sort" @click="setSort('dividendTotal')">
              dividend total<span class="sort-indicator">{{ sortIndicator('dividendTotal') }}</span>
            </th>
            <th class="th-pnl th-num th-sort" @click="setSort('pnl')">
              PnL<span class="sort-indicator">{{ sortIndicator('pnl') }}</span>
            </th>
            <th class="th-small th-num th-sort" @click="setSort('balance')">
              balance<span class="sort-indicator">{{ sortIndicator('balance') }}</span>
            </th>
            <th class="th-small th-num th-sort" @click="setSort('balanceJpy')">
              balance JPY<span class="sort-indicator">{{ sortIndicator('balanceJpy') }}</span>
            </th>

            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="trustbalance in displayTrustBalances"
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
            <td class="td-small td-num">
              <span class="num-int">{{ formatParts(trustbalance.noItem, 4).int }}</span><span v-if="4 > 0" class="num-dot">.</span><span v-if="4 > 0" class="num-frac">{{ formatParts(trustbalance.noItem, 4).frac }}</span>
            </td>
            <td class="td-small td-num">
              <span class="num-int">{{ formatParts(trustbalance.basicPrice, 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(trustbalance.basicPrice, 2).frac }}</span>
            </td>
            <td class="td-small td-num">
              <span class="num-int">{{ formatParts(trustbalance.averagePurchasePrice, 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(trustbalance.averagePurchasePrice, 2).frac }}</span>
            </td>
            <td class="td-small td-num">
              <span class="num-int">{{ formatParts(dividendTotals[trustbalance.id], 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(dividendTotals[trustbalance.id], 2).frac }}</span>
            </td>
            <td :class="pnlClass(plFor(trustbalance)) + ' td-num'">
              <span class="num-int">{{ formatParts(plFor(trustbalance), 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(plFor(trustbalance), 2).frac }}</span>
            </td>
            <td class="td-small td-num">
              <span class="num-int">{{ formatParts(trustbalance.balance, 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(trustbalance.balance, 2).frac }}</span>
            </td>
            <td class="td-small td-num">
              <span class="num-int">{{ formatParts((Number(trustbalance.balance) || 0) * rateFor(trustbalance.currency), 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts((Number(trustbalance.balance) || 0) * rateFor(trustbalance.currency), 2).frac }}</span>
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
                <button class="btn btn-outline-primary btn-sm" @click="navigate" title="Edit" aria-label="Edit">
                  ✎
                </button>
              </router-link>
            </td>
            <td>
              <button class="btn btn-outline-danger btn-sm" @click="deleteTrustBalance(trustbalance.id)" title="Delete" aria-label="Delete">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
      dividendTotals: {},
      loadingDividendTotals: false,
      sortKey: null,
      sortAsc: true,
    };
  },
  computed: {
    ...mapState(['exchangeRates']),
    displayTrustBalances() {
      const list = Array.isArray(this.trustbalances) ? [...this.trustbalances] : [];
      if (!this.sortKey) return list;
      const dir = this.sortAsc ? 1 : -1;
      return list.sort((a, b) => {
        const va = this.getSortValue(a, this.sortKey);
        const vb = this.getSortValue(b, this.sortKey);
        const aEmpty = va === null || va === undefined || va === '';
        const bEmpty = vb === null || vb === undefined || vb === '';
        if (aEmpty && bEmpty) return 0;
        if (aEmpty) return 1;
        if (bEmpty) return -1;
        const aNum = typeof va === 'number' && Number.isFinite(va);
        const bNum = typeof vb === 'number' && Number.isFinite(vb);
        let cmp = 0;
        if (aNum && bNum) {
          cmp = va - vb;
        } else {
          cmp = String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' });
        }
        if (cmp === 0) {
          const ai = this.trustbalances.indexOf(a);
          const bi = this.trustbalances.indexOf(b);
          cmp = ai - bi;
        }
        return cmp * dir;
      });
    },
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
    formatParts(value, decimals = 2) {
      const n = Number(value);
      if (!Number.isFinite(n)) return { int: '---', frac: ''.padEnd(decimals, '0') };
      const fixed = n.toFixed(decimals);
      const [i, f = ''] = fixed.split('.');
      const intNum = Number(i);
      // Preserve sign and thousand separators
      const intStr = Number.isFinite(intNum) ? intNum.toLocaleString() : i;
      return { int: intStr, frac: f };
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
        await this.loadDividendTotals(all);
      } catch (e) {
        console.log(e);
      }
      return all;
    },
    async deleteTrustBalance(trustbalanceId) {
      const index = this.trustbalances.findIndex(tb => tb.id === trustbalanceId);
      if (index === -1) return;
      if (!confirm("Delete TrustBalance?")) return;

      await API.graphql({
        query: deleteTrustBalance,
        variables: { input: { id: trustbalanceId } },
      })
        .then((result) => {
          console.log(result);
          this.trustbalances.splice(index, 1);
          this.$delete(this.dividendTotals, trustbalanceId);
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
    async loadDividendTotals(balances) {
      this.loadingDividendTotals = true;
      const totals = {};
      try {
        for (const tb of balances) {
          if (!tb?.id) continue;
          try {
            const total = await this.fetchDividendTotalForTrustBalance(tb.id);
            totals[tb.id] = total;
          } catch (err) {
            console.log(`[dividendTotal] failed for ${tb.id}`, err);
            totals[tb.id] = 0;
          }
        }
        this.dividendTotals = totals;
      } finally {
        this.loadingDividendTotals = false;
      }
    },
    async fetchDividendTotalForTrustBalance(trustBalanceId) {
      let nextToken = null;
      let total = 0;
      const filter = {
        and: [
          { trustBalanceId: { eq: trustBalanceId } },
          { tradeType: { eq: Enum.EnumTradeType.DIVIDEND.val } },
        ],
      };
      do {
        const res = await API.graphql({
          query: listTrustTransactions,
          variables: { filter, limit: 100, nextToken },
        });
        const data = res?.data?.listTrustTransactions;
        const items = (data?.items || []).filter(Boolean);
        for (const item of items) {
          const value = Number(item.dividend);
          if (Number.isFinite(value)) total += value;
        }
        nextToken = data?.nextToken || null;
      } while (nextToken);
      return total;
    },
    getSortValue(tb, key) {
      switch (key) {
        case 'currency':
        case 'name':
        case 'memo':
        case 'type':
        case 'code':
          return tb && tb[key] ? String(tb[key]) : '';
        case 'noItem':
          return Number(tb?.noItem) || 0;
        case 'basicPrice':
          return Number(tb?.basicPrice) || 0;
        case 'averagePurchasePrice':
          return Number(tb?.averagePurchasePrice) || 0;
        case 'dividendTotal':
          return Number(this.dividendTotals[tb?.id]) || 0;
        case 'pnl':
          return Number(this.plFor(tb)) || 0;
        case 'balance':
          return Number(tb?.balance) || 0;
        case 'balanceJpy':
          return (Number(tb?.balance) || 0) * this.rateFor(tb?.currency);
        default: {
          const value = tb ? tb[key] : null;
          const num = Number(value);
          if (Number.isFinite(num)) return num;
          return value;
        }
      }
    },
    setSort(key) {
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = key;
        this.sortAsc = true;
      }
    },
    sortIndicator(key) {
      if (this.sortKey !== key) return '';
      return this.sortAsc ? '▲' : '▼';
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
            const kind = String(t.tradeType || '').toUpperCase();
            let qty = Math.abs(Number(t.noItem) || 0);
            let price = Number(t.basicPrice);
            if (!Number.isFinite(price)) price = 0;
            const buyAmt = Number(t.buy) || 0;
            const sellAmt = Number(t.sell) || 0;
            if (price > 0) lastPrice = price; // 直近の価格を保持
            // SELL で負の数量保存に対応: 計算では絶対値で扱う
            // qty が欠損している場合、金額/単価から補完
            if ((!qty || qty <= 0) && price > 0) {
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
            // SELL で単価/数量が欠損する場合、平均単価から数量を推定（最後の手段）
            if ((kind === Enum.EnumTradeType.SELL.val || kind === 'SELL') && (!qty || qty <= 0)) {
              if (sellAmt > 0 && price > 0) {
                qty = sellAmt / price;
                console.log(`[updateBalances] supplemented qty using sell/bp TB ${tbid} tx ${t.id}: qty=${qty}`);
              } else if (sellAmt > 0 && avg > 0) {
                qty = sellAmt / avg;
                console.log(`[updateBalances] inferred qty from avg TB ${tbid} tx ${t.id}: qty=${qty} using sell=${sellAmt} avg=${avg}`);
              }
            }
            // 投信の 1/10000 口表記を自動補正（buy/sell 金額と照合してスケール判定）
            const amtForScale = (kind === Enum.EnumTradeType.SELL.val || kind === 'SELL') ? sellAmt : buyAmt;
            if (qty > 0 && price > 0 && amtForScale > 0) {
              const ratio = (qty * price) / amtForScale;
              if (ratio > 9000 && ratio < 11000) {
                console.log(`[updateBalances] scale 1/10000 applied TB ${tbid} tx ${t.id}: qty ${qty} -> ${qty/10000}`);
                qty = qty / 10000;
              }
            }
            // 単価が無い場合でも、TB 基準価格と金額から 1/10000 スケールを推定
            if (qty > 0 && price <= 0) {
              const refPrice = tbBasicById[tbid] || 0;
              const amt = amtForScale;
              if (refPrice > 0 && amt > 0) {
                const ratio = (qty * refPrice) / amt;
                if (ratio > 9000 && ratio < 11000) {
                  console.log(`[updateBalances] scale 1/10000 (ref TB basic) TB ${tbid} tx ${t.id}: qty ${qty} -> ${qty/10000}`);
                  qty = qty / 10000;
                }
              }
            }
            // 単価が欠損している場合、金額や平均単価から補完
            if (qty > 0 && price <= 0) {
              if (amtForScale > 0) {
                price = amtForScale / qty;
                console.log(`[updateBalances] supplemented price TB ${tbid} tx ${t.id}: price=${price} using amt=${amtForScale} qty=${qty}`);
              } else if ((kind === Enum.EnumTradeType.SELL.val || kind === 'SELL') && avg > 0) {
                price = avg;
                console.log(`[updateBalances] fallback price from avg TB ${tbid} tx ${t.id}: price=${price}`);
              } else if (lastPrice > 0) {
                price = lastPrice;
                console.log(`[updateBalances] fallback price from lastPrice TB ${tbid} tx ${t.id}: price=${price}`);
              }
            }
            if (price > 0) lastPrice = price;

            if (kind === Enum.EnumTradeType.BUY.val || kind === 'BUY') {
              if (qty > 0) {
                units += qty;
                const costDelta = price > 0 ? price * qty : (buyAmt > 0 ? buyAmt : avg * qty);
                if (costDelta > 0) cost += costDelta;
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
.th-sort { cursor: pointer; user-select: none; }
.sort-indicator { margin-left: 4px; font-size: 0.75em; opacity: 0.7; }

/* Highlight PnL */
.th-pnl { font-size: 0.95rem; font-weight: 700; }
.td-pnl { font-size: 1.05rem; font-weight: 700; }
.td-pnl.pnl-pos { color: #0a8; }
.td-pnl.pnl-neg { color: #d33; }
.td-pnl.pnl-zero { color: #888; }

/* Right align numeric columns with tabular figures */
.th-num { text-align: right; }
.td-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.num-int { font-variant-numeric: tabular-nums; }
.num-frac { font-size: 0.8em; font-variant-numeric: tabular-nums; }
.num-dot { padding: 0 0.05em; opacity: 0.7; }

.table-scroll {
  max-height: 70vh;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background: #fff;
}
.table-scroll table {
  margin-bottom: 0;
}
.table-sticky thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #fafafa;
  box-shadow: inset 0 -1px 0 #dee2e6;
}
</style>
