<template>
  <div>
    <h1>Summary2</h1>

    <button class="btn btn-success" style="margin-left:8px" @click="calcTotalReturn()">calc total return</button>
    <br/>

    <br/>

    total return: {{ this.totalReturn.toLocaleString() }}
    <br/>
    accounts total (JPY): {{ this.accountsJpy.toLocaleString() }}
    <br/>
    active deposit principal (JPY): {{ this.activePrincipalJpy.toLocaleString() }}
    <br/>
    trust evaulated value (JPY): {{ this.trustPnLJpy.toLocaleString() }}
    <hr/>

    <!-- 為替レート一覧表示 -->
    <h2>為替レート一覧</h2>
    <table class="table table-bordered" style="max-width:400px;">
      <thead>
        <tr>
          <th>通貨</th>
          <th>レート (1通貨あたりの円)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(rate, currency) in exchangeRates" :key="currency">
          <td>{{ currency }}</td>
          <td>{{ rate }}</td>
        </tr>
      </tbody>
    </table>




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
  computed: {
    ...mapState(['exchangeRates'])
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
    };
  },
  methods: {
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
        let accountsJpy = 0;
        for (const a of accounts) {
          const rate = Number(a.exchangeRate) || 0;
          const bal = Number(a.balance) || 0;
          accountsJpy += bal * rate;
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
          //const avg = Number(tb.averagePurchasePrice) || 0;
          //const diff = price - avg;
          //平均取得価格を引く必要なし。accountがマイナスになっているので。
          const diff = price;
          const rate = rateByCcy.get(tb.currency) || 0;
          trustPnLJpy += units * diff * rate;
        }
        this.trustPnLJpy = trustPnLJpy;
        console.log("trustPnLJpy", trustPnLJpy);

        // 5) トータルリターン
        this.totalReturn =  accountsJpy + activePrincipalJpy + trustPnLJpy;
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
};
</script>