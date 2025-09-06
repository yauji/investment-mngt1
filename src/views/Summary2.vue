<template>
  <div>
    <h1>Summary2</h1>


    <ul>
      <li>accountsとtrust balanceのupdateをしたあとに実行すること。</li>
      <li>4はaccountに反映されるので、参考。</li>
    </ul>

    
    <button class="btn btn-success" style="margin-left:8px" @click="calcTotalReturn()">calc total return</button>

    <div class="totals-wrap">
      <div class="total-card highlight">
        <div class="label">Total Return (JPY)</div>
        <div class="value">{{ totalReturn.toLocaleString() }}</div>
        <div class="formula">= (2 + 3) - 1</div>
      </div>
      <div class="cards">
        <div class="total-card">
          <div class="label">1. Accounts Total (JPY)</div>
          <div class="value small">{{ accountsJpy.toLocaleString() }}</div>
        </div>
        <div class="total-card">
          <div class="label">2. Active Deposit Principal (JPY)</div>
          <div class="value small">{{ activePrincipalJpy.toLocaleString() }}</div>
        </div>
        <div class="total-card">
          <div class="label">3. Trust Evaluated Value (JPY)</div>
          <div class="value small">{{ trustPnLJpy.toLocaleString() }}</div>
        </div>
        <div class="total-card">
          <div class="label">4. Dividends Total (JPY)</div>
          <div class="value small">{{ dividendsJpy.toLocaleString() }}</div>
        </div>
      </div>
    </div>
    <hr/>

    <!-- Charts -->
    <h3>Charts</h3>
    <div class="chart-wrap">
      <svg :width="chartW" :height="chartH">
        <!-- axes -->
        <line :x1="m" :y1="chartH - m" :x2="chartW - m" :y2="chartH - m" stroke="#ccc" />
        <line :x1="m" :y1="m" :x2="m" :y2="chartH - m" stroke="#ccc" />

        <!-- stacked bar for components (1,2,3) -->
        <g :transform="`translate(${m + 60},0)`">
          <text :x="-30" :y="chartH - m + 16" font-size="12" text-anchor="middle">1+2+3</text>
          <template v-for="(seg, idx) in stackedSegments" :key="'seg-'+idx">
            <rect
              :x="0"
              :y="seg.y"
              :width="barW"
              :height="seg.h"
              :fill="seg.color"
              :opacity="0.9"
            />
            <text v-if="seg.h >= 14" :x="barW/2" :y="seg.y + 12" font-size="11" text-anchor="middle" fill="#fff">{{ seg.label }}</text>
          </template>
        </g>

        <!-- total return bar -->
        <g :transform="`translate(${m + 160},0)`">
          <text :x="barW/2" :y="chartH - m + 16" font-size="12" text-anchor="middle">Total</text>
          <rect :x="0" :y="totalBar.y" :width="barW" :height="totalBar.h" fill="#0a7" opacity="0.9" />
          <text v-if="totalBar.h >= 14" :x="barW/2" :y="totalBar.y + 12" font-size="11" text-anchor="middle" fill="#fff">{{ totalReturn.toLocaleString() }}</text>
        </g>

        <!-- y-axis max label -->
        <text :x="m" :y="m - 4" font-size="11" fill="#666">{{ chartMax.toLocaleString() }}</text>
      </svg>

      <!-- Legend -->
      <div class="legend">
        <span class="legend-item"><i class="swatch" style="background:#888;"></i>1. Accounts (−)</span>
        <span class="legend-item"><i class="swatch" style="background:#4aa3df;"></i>2. Active Principal</span>
        <span class="legend-item"><i class="swatch" style="background:#f6b26b;"></i>3. Trust Evaluated</span>
        <span class="legend-item"><i class="swatch" style="background:#0a7;"></i>Total Return</span>
      </div>
    </div>

    <!-- 為替レート一覧表示 -->
    <h2 class="d-flex align-items-center" style="gap: 12px;">
      為替レート一覧
      <button class="btn btn-outline-primary btn-sm" @click="fetchFx">最新為替を取得</button>
    </h2>
    <table class="table table-bordered" style="max-width:520px;">
      <thead>
        <tr>
          <th>通貨</th>
          <th>レート (1通貨あたりの円)</th>
          <th>編集</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(rate, currency) in exchangeRates" :key="currency">
          <td>{{ currency }}</td>
          <td>{{ rate }}</td>
          <td>
            <input type="number" step="0.0001" class="form-control" style="max-width:160px;"
                   v-model.number="editRates[currency]" />
          </td>
        </tr>
      </tbody>
    </table>
    <button class="btn btn-primary btn-sm" @click="saveRatesToStore">ストアへ保存</button>

    <!-- 為替レート編集 -->
    <h3>為替レートを編集</h3>
    <table class="table table-bordered" style="max-width:480px;">
      <thead>
        <tr>
          <th>通貨</th>
          <th>現在値</th>
          <th>新しい値</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(rate, currency) in exchangeRates" :key="'edit-' + currency">
          <td>{{ currency }}</td>
          <td>{{ rate }}</td>
          <td>
            <input type="number" step="0.0001" class="form-control" style="max-width:160px;"
                   v-model.number="editRates[currency]" />
          </td>
        </tr>
      </tbody>
    </table>
    <button class="btn btn-primary" @click="saveRatesToStore">ストアへ保存</button>




    <hr />
    <h3>Check profit and loss</h3>
    <br />
    deposit Diff: {{ this.depositDiff.toLocaleString() }}
    （参考）
    <br />
    <br />
    deposit active: {{ this.depositActive.toLocaleString() }}
    <br />
    value Account: {{ this.valueAccount.toLocaleString() }}
    <br />
    value tb: {{ this.valueTB.toLocaleString() }}
    <br />
    <br />
    total profit and loss(deposit active + value account + value tb):
    {{ this.pl2.toLocaleString() }}
    <br />
    total return: {{ this.totalReturn.toLocaleString() }}
    <br />
    <ul>
      <li>事前にすべき処理</li>
      <ul>
        <li>accountをupdateすること</li>
        <li>trans balanceをupdateすること</li>
      </ul>
    </ul>

    <br />
    <button class="btn btn-primary" @click="calc2()">calc</button>





    <hr />
    <button class="btn btn-primary" @click="calc4()">calc4</button>
    <button class="btn btn-secondary" style="margin-left:8px" @click="calcAvgTrustPurchasePrice()">calc trust avg price</button>


    <input type="checkbox" id="jpy" value="jpy" v-model="checkedCurrencys" />
    <label for="jpy">jpy</label>
    <input type="checkbox" id="fc" value="fc" v-model="checkedCurrencys" />
    <label for="fc">fc</label>
    <br />
    <span>Checked names: {{ checkedCurrencys }}</span>

    <table class="table table-striped">
      <thead>
        <tr>
          <th></th>
          <th>year</th>
          <th>deposit active</th>
          <th>value account</th>
          <th>total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(e, index) in evals4" :key="e.year">
          <td>{{ index }}</td>
          <td>{{ e.year }}</td>
          <td>{{ e.dactive.toLocaleString() }}</td>
          <td>{{ e.vaccount.toLocaleString() }}</td>
          <td>{{ e.total.toLocaleString() }}</td>
        </tr>
        <tr>
          <td></td>
          <td>total</td>
          <td>{{ dactive4.toLocaleString() }}</td>
          <td>{{ vaccount4.toLocaleString() }}</td>
          <td>{{ total4.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>


    <hr/>
  
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listDeposits, listAccounts, listTrustBalances, listTrustTransactions } from "../graphql/queries";
import { updateTrustBalance } from "../graphql/mutations";
import { mapState } from 'vuex';

import * as Enum from "@/Enum";

export default {
  name: "DepositIndex",
  computed___REMOVE: {
    ...mapState(['exchangeRates']),
    chartMax() {
      const sumStack = this.clampPos(this.accountsJpy) + this.clampPos(this.activePrincipalJpy) + this.clampPos(this.trustPnLJpy);
      const totalAbs = Math.abs(Number(this.totalReturn) || 0);
      const base = Math.max(sumStack, totalAbs, 1);
      const pow = Math.pow(10, Math.max(0, Math.floor(Math.log10(base)) - 1));
      return Math.ceil(base / pow) * pow;
    },
    stackedSegments() {
      const max = this.chartMax;
      const segs = [];
      let acc = 0;
      const addSeg = (value, color, label) => {
        const h = this.scaleY(Math.abs(value), max);
        const y = this.chartH - this.m - (acc + h);
        segs.push({ h, y, color, label });
        acc += h;
      };
      addSeg(this.accountsJpy, '#888', this.accountsJpy.toLocaleString());
      addSeg(this.activePrincipalJpy, '#4aa3df', this.activePrincipalJpy.toLocaleString());
      addSeg(this.trustPnLJpy, '#f6b26b', this.trustPnLJpy.toLocaleString());
      return segs;
    },
    totalBar() {
      const max = this.chartMax;
      const h = this.scaleY(Math.abs(this.totalReturn), max);
      const y = this.chartH - this.m - h;
      return { h, y };
    },
  },
  data() {
    return {
      evals4: [],
      checkedCurrencys: ["jpy", "fc"],
      dactive4: 0,
      vaccount4: 0,
      total4: 0,
      depositDiff: 0,
      depositActive: 0,
      valueAccount: 0,
      valueTB: 0,
      pl2: 0,
      totalReturn: 0,
      accountsJpy: 0,
      activePrincipalJpy: 0,
      trustPnLJpy: 0,
      dividendsJpy: 0,
      editRates: {},
      // chart config
      chartW: 520,
      chartH: 260,
      m: 28,
      barW: 48,
    };
  },
  created() {
    // 初期値をストアから編集用にコピー
    const init = {};
    for (const [ccy, rate] of Object.entries(this.exchangeRates || {})) init[ccy] = rate;
    this.editRates = init;
  },
  methods: {
    // Chart helpers
    clampPos(v) { return Math.max(0, Number(v) || 0); },
    scaleY(v, max) {
      const h = this.chartH - 2 * this.m;
      const val = this.clampPos(v);
      const mm = max > 0 ? max : 1;
      return (val / mm) * h;
    },
    rateForCurrency(ccy, rateByCcyMap) {
      //console.log("xxx11 rateForCurrency", ccy, rateByCcyMap);
      const c = String(ccy || '').toUpperCase();
      if (!c || c === 'JPY') return 1;
      // Prefer Vuex exchangeRates if available
      const storeRates = (this.$store && this.$store.state && this.$store.state.exchangeRates) ? this.$store.state.exchangeRates : {};
      const v1 = Number(storeRates[c]);
      if (Number.isFinite(v1) && v1 > 0) return v1;
      // Fallback to account-derived map
      const v2 = Number(rateByCcyMap.get ? rateByCcyMap.get(c) : rateByCcyMap[c]);
      if (Number.isFinite(v2) && v2 > 0) return v2;
      return 0;
    },
    async fetchFx() {
      try {
        await this.$store.dispatch('fetchExchangeRates');
        // 最新のストア値で編集欄を更新
        const init = {};
        for (const [ccy, rate] of Object.entries(this.exchangeRates || {})) init[ccy] = rate;
        this.editRates = init;
        alert('最新の為替レートを取得しました');
      } catch (e) {
        console.error('fetchExchangeRates failed', e);
        alert('為替レートの取得に失敗しました');
      }
    },
    saveRatesToStore() {
      const payload = {};
      for (const [ccy, val] of Object.entries(this.editRates)) {
        const v = Number(val);
        if (!Number.isNaN(v) && v > 0) payload[ccy] = v;
      }
      this.$store.commit('setExchangeRates', payload);
      alert('為替レートを更新しました');
    },
    async calcTotalReturn() {
      try {
        // 1) Accounts 取得 & マッピング
        let accounts = [];
        try {
          const res = await API.graphql({ query: listAccounts });
          accounts = res.data.listAccounts.items || [];
        } catch (e) {
          console.error('listAccounts failed', e);
          accounts = [];
        }
        const accById = new Map();
        const rateByCcy = new Map();
        for (const a of accounts) {
          accById.set(a.id, a);
          // 通貨→代表アカウントの為替レート（同一通貨が複数あっても最後のを採用）
          rateByCcy.set(a.currency, Number(a.exchangeRate) || 0);
        }

        // 2) accountの評価額合計（JPY）
        //    JPY口座はそのまま、外貨口座は「Vuexレート→口座レート」の優先順で円換算
        let accountsJpy = 0;
        for (const a of accounts) {
          const bal  = Number(a.balance) || 0;
          const ccy  = String(a.currency || '').toUpperCase();
          const rate = this.rateForCurrency(ccy, rateByCcy);
          accountsJpy += bal * (rate || 0);
        }
        this.accountsJpy = accountsJpy;
        console.log("accountsJpy", accountsJpy);

        // 3) active deposit の principal 合計（JPY）
        let activePrincipalJpy = 0;
        let deposits = [];
        try {
          const res = await API.graphql({ query: listDeposits });
          deposits = res.data.listDeposits.items || [];
        } catch (e) {
          console.error('listDeposits failed', e);
          deposits = [];
        }
        for (const d of deposits) {
          // v1環境では enum が文字列のことが多い。Enum も併存しているので両方ケア
          const isActive = d.status === 'ACTIVE' || d.status === Enum.EnumDepositStatus?.ACTIVE?.val;
          if (!isActive) continue;
          const pri = Number(d.principal) || 0;
          // principalAccountId を優先利用（なければ currency → rate）
          let rate = 0;
          if (d.principalAccountId && accById.has(d.principalAccountId)) {
            rate = Number(accById.get(d.principalAccountId).exchangeRate) || 0;
          } else if (d.principalAccount?.currency && rateByCcy.has(d.principalAccount.currency)) {
            rate = Number(rateByCcy.get(d.principalAccount.currency)) || 0;
          }
          activePrincipalJpy += pri * rate;
        }
        this.activePrincipalJpy = activePrincipalJpy;
        console.log("activePrincipalJpy", activePrincipalJpy);

        // 4) trustbalance の評価益（JPY）= noItem * (basicPrice - averagePurchasePrice) * rate
        let trustPnLJpy = 0;
        let trustbalances = [];
        try {
          const res = await API.graphql({ query: listTrustBalances });
          trustbalances = res.data.listTrustBalances.items || [];
        } catch (e) {
          console.error('listTrustBalances failed', e);
          trustbalances = [];
        }
        for (const tb of trustbalances) {
          const units = Number(tb.noItem) || 0;
          const price = Number(tb.basicPrice) || 0;
          const diff = price; // 平均取得価格は引かない方針
          const rate = this.rateForCurrency(tb.currency, rateByCcy);
          trustPnLJpy += units * diff * (rate || 0);
        }
        this.trustPnLJpy = trustPnLJpy;
        console.log("trustPnLJpy", trustPnLJpy);

        // 4.5) trust transaction の DIVIDEND 合計（JPY）
        let dividendsJpy = 0;
        try {
          let nextToken = null;
          do {
            const res = await API.graphql({
              query: listTrustTransactions,
              variables: { limit: 1000, nextToken },
            });
            const data = res.data?.listTrustTransactions;
            const items = data?.items || [];
            for (const tx of items) {
              const kind = tx?.tradeType;
              if (kind === 'DIVIDEND' || kind === Enum.EnumTradeType?.DIVIDEND?.val) {
                const amt = Number(tx?.dividend) || 0;
                // 優先: トランザクションの入出金先アカウントの為替レート
                // 優先: Vuexレート→口座レート。JPYは常に1。
                let ccy = 'JPY';
                if (tx?.accountId && accById.has(tx.accountId)) {
                  ccy = accById.get(tx.accountId)?.currency || 'JPY';
                } else if (tx?.account?.currency) {
                  ccy = tx.account.currency;
                }
                const rate = this.rateForCurrency(ccy, rateByCcy);
                dividendsJpy += amt * (rate || 0);
                console.log("xxx21 dividendsJpy", dividendsJpy, amt, rate);
              }
            }
            nextToken = data?.nextToken || null;
          } while (nextToken);
        } catch (e) {
          console.error('listTrustTransactions (DIVIDEND sum) failed', e);
        }
        this.dividendsJpy = dividendsJpy;
        console.log("dividendsJpy", dividendsJpy);

        // 5) トータルリターン
        //this.totalReturn =  accountsJpy + activePrincipalJpy + trustPnLJpy + dividendsJpy;
        this.totalReturn =  accountsJpy + activePrincipalJpy + trustPnLJpy ;
      } catch (e) {
        console.error(e);
        this.totalReturn = 0;
        alert('calc total return failed. See console for details.');
      }
    },
    async calcAvgTrustPurchasePrice() {
      try {
        // 0) 事前に trust balances を取得（存在確認用）
        const tbMap = new Map();
        {
          let nextToken = null;
          do {
            const res = await API.graphql({
              query: listTrustBalances,
              variables: { limit: 1000, nextToken },
            });
            const data = res.data?.listTrustBalances;
            for (const tb of data?.items || []) tbMap.set(tb.id, tb);
            nextToken = data?.nextToken || null;
          } while (nextToken);
        }

        // 1) 全 TrustTransaction（全種別）をページングで取得
        let nextToken = null;
        const txs = [];
        do {
          const res = await API.graphql({
            query: listTrustTransactions,
            variables: { limit: 1000, nextToken },
          });
          const data = res.data?.listTrustTransactions;
          if (data?.items) txs.push(...data.items);
          nextToken = data?.nextToken || null;
        } while (nextToken);

        // 2) trustBalanceId ごとにグループ化し、日付昇順にソート
        const byTB = new Map();
        for (const t of txs) {
          if (!t?.trustBalanceId) continue;
          if (!byTB.has(t.trustBalanceId)) byTB.set(t.trustBalanceId, []);
          byTB.get(t.trustBalanceId).push(t);
        }
        const parseDate = (s) => (s ? new Date(s).getTime() : 0);
        for (const arr of byTB.values()) arr.sort((a, b) => parseDate(a.date) - parseDate(b.date));

        // 3) 各 TB ごとにトランザクションを順に適用し、都度 averagePurchasePrice を更新
        let updateCount = 0;
        for (const [tbid, arr] of byTB.entries()) {
          if (!tbMap.has(tbid)) continue; // 存在しないTBはスキップ
          let units = 0;         // 走行口数
          let cost  = 0;         // 走行原価（avg * units）
          let avg   = 0;         // 平均取得価格

          for (const t of arr) {
            const qty = Number(t.noItem) || 0;
            const price = Number(t.basicPrice) || 0;
            const kind = t.tradeType;

            if (kind === 'BUY') {
              if (qty > 0 && price > 0) {
                cost += price * qty;   // 追加コスト
                units += qty;          // 口数増
                avg = units > 0 ? cost / units : 0;
              }
            } else if (kind === 'SELL') {
              if (qty > 0) {
                // 売却：平均は維持、口数のみ減（ゼロ未満にしない）
                units = Math.max(0, units - qty);
                if (units === 0) {
                  cost = 0; // 保有ゼロなら原価もリセット
                  avg = 0;
                } else {
                  cost = avg * units; // 平均は据え置きで原価を再計算
                }
              }
            } else {
              // DIVIDEND 等は平均/口数に影響しない
            }

            // トランザクション適用ごとに TrustBalance.averagePurchasePrice を更新
            await API.graphql({
              query: updateTrustBalance,
              variables: { input: { id: tbid, averagePurchasePrice: avg } },
            });
            updateCount += 1;
          }
        }

        alert(`updated per-transaction average price steps: ${updateCount}`);
      } catch (e) {
        console.error(e);
        alert('calc trust avg price (per tx) failed. See console for details.');
      }
    },
    async calc2() {
      var depositActive = 0;
      var depositDiff = 0;
      var valueAccount = 0;

      var valueTB = 0;

      //get accounts---
      var accounts;
      await API.graphql({
        query: listAccounts,
      })
        .then((result) => {
          //console.log(result);
          accounts = result.data.listAccounts.items;
        })
        .catch((error) => {
          console.log(error);
        });

      const dAccounts = [];
      for (const ka in accounts) {
        const a = accounts[ka];
        dAccounts[a.currency] = a;
      }
      //console.log("-------123");
      //console.log(dAccounts);

      //get deposits----
      var deposits;
      await API.graphql({
        query: listDeposits,
      })
        .then((result) => {
          //console.log(result);
          deposits = result.data.listDeposits.items;
        })
        .catch((error) => {
          console.log(error);
        });

      for (const kd in deposits) {
        const d = deposits[kd];

        //value-------
        //value - deposit----
        if (d.status == Enum.EnumDepositStatus.ACTIVE.val) {
          const exrate = dAccounts[d.principalAccount.currency].exchangeRate;
          depositActive += exrate * d.principal;
        } else {
          const exratePri = dAccounts[d.principalAccount.currency].exchangeRate;
          const exrateVal = dAccounts[d.valueAccount.currency].exchangeRate;
          depositDiff += d.value * exrateVal - d.principal * exratePri;
        }
      }

      //value - account----
      for (const ka in accounts) {
        const a = accounts[ka];
        valueAccount += a.balance * a.exchangeRate;
        //console.log("------3", valueAccount, a);
      }

      // value - trust balance----
      var trustbalances = {};
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

      for (const ktb in trustbalances) {
        const tb = trustbalances[ktb];
        valueTB += tb.balance * dAccounts[tb.currency].exchangeRate;
      }

      this.depositDiff = depositDiff;

      this.depositActive = depositActive;
      this.valueAccount = valueAccount;
      this.valueTB = valueTB;

      this.pl2 = depositActive + valueAccount + valueTB;
    },
    async calc4() {
      let accounts = [];
      try {
        const res = await API.graphql({ query: listAccounts });
        accounts = res.data.listAccounts.items;
      } catch (error) {
        console.log(error);
      }

      const evals4 = [];
      this.dactive4 = 0;
      this.vaccount4 = 0;
      this.total4 = 0;

      for (let year = 2007; year < 2024; year++) {
        let depositActive = 0;
        let valueAccount = 0;
        const dAccounts = [];

        for (const a of accounts) {
          a.balance = 0;
          if (
            this.checkedCurrencys.length === 2 ||
            (this.checkedCurrencys.includes("jpy") && a.currency === "JPY") ||
            (this.checkedCurrencys.includes("fc") && a.currency !== "JPY")
          ) {
            dAccounts[a.id] = a;
          }
        }

        const filter = {
          date: {
            ge: new Date(`${year}/01/01`),
            lt: new Date(`${year + 1}/01/01`),
          },
        };

        let deposits = [];
        try {
          const res = await API.graphql({ query: listDeposits, variables: { filter } });
          const deposits0 = res.data.listDeposits.items;

          deposits = deposits0.filter((d) => {
            if (this.checkedCurrencys.length === 2) return true;
            if (this.checkedCurrencys.includes("jpy")) {
              return d.principalAccount.currency === "JPY" &&
                (d.status !== "FINISHED" || d.valueAccount.currency === "JPY");
            }
            if (this.checkedCurrencys.includes("fc")) {
              return (d.status === "FINISHED" &&
                (d.principalAccount.currency !== "JPY" || d.valueAccount.currency !== "JPY")) ||
                (d.status !== "FINISHED" && d.principalAccount.currency !== "JPY");
            }
            return false;
          });
        } catch (error) {
          console.log(error);
        }

        for (const d of deposits) {
          dAccounts[d.principalAccountId].balance -= d.principal;
          if (d.status === "FINISHED") {
            dAccounts[d.valueAccountId].balance += d.value;
          } else {
            const exrate = dAccounts[d.principalAccountId].exchangeRate;
            depositActive += exrate * d.principal;
          }
        }

        for (const a of accounts) {
          valueAccount += a.balance * a.exchangeRate;
        }

        evals4.push({
          year,
          dactive: depositActive,
          vaccount: valueAccount,
          total: depositActive + valueAccount,
        });

        this.dactive4 += depositActive;
        this.vaccount4 += valueAccount;
        this.total4 += depositActive + valueAccount;
      }

      this.evals4 = evals4;
    },
  },
  computed: {
    chartMax() {
      const sumStack = this.clampPos(this.accountsJpy) + this.clampPos(this.activePrincipalJpy) + this.clampPos(this.trustPnLJpy);
      const totalAbs = Math.abs(Number(this.totalReturn) || 0);
      const base = Math.max(sumStack, totalAbs, 1);
      const pow = Math.pow(10, Math.max(0, Math.floor(Math.log10(base)) - 1));
      return Math.ceil(base / pow) * pow;
    },
    stackedSegments() {
      const max = this.chartMax;
      const segs = [];
      let acc = 0;
      const addSeg = (value, color, label) => {
        const h = this.scaleY(Math.abs(value), max);
        const y = this.chartH - this.m - (acc + h);
        segs.push({ h, y, color, label });
        acc += h;
      };
      addSeg(this.accountsJpy, '#888', this.accountsJpy.toLocaleString());
      addSeg(this.activePrincipalJpy, '#4aa3df', this.activePrincipalJpy.toLocaleString());
      addSeg(this.trustPnLJpy, '#f6b26b', this.trustPnLJpy.toLocaleString());
      return segs;
    },
    totalBar() {
      const max = this.chartMax;
      const h = this.scaleY(Math.abs(this.totalReturn), max);
      const y = this.chartH - this.m - h;
      return { h, y };
    },
  },
};
</script>
<style scoped>
.totals-wrap {
  margin: 12px 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.total-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.total-card .label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}
.total-card .value {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.total-card .value.small { font-size: 1.2rem; }
.total-card.highlight {
  background: #ffffff; /* remove gradient */
  border-color: #cce8f6;
}
.total-card.highlight .value {
  color: #0a7;
  font-size: 2.2rem;
}
.total-card .formula {
  font-size: 0.8rem;
  color: #999;
}
.chart-wrap { margin: 10px 0 18px; }
.legend { margin-top: 8px; color: #666; font-size: 0.9rem; display: flex; gap: 16px; flex-wrap: wrap; }
.legend .swatch { display: inline-block; width: 12px; height: 12px; border-radius: 2px; margin-right: 6px; vertical-align: -1px; }
</style>
