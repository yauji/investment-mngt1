<template>
  <div>
    <h1>Summary2</h1>

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
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listDeposits, listAccounts, listTrustBalances } from "../graphql/queries";
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
    };
  },
  methods: {

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