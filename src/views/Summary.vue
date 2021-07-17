<template>
  <div>
    <h1>Summary</h1>

    <hr />
    <h3>Check ratio of investment amount</h3>
    <ul>
      <li>safe: {{ safe5.toLocaleString() }}</li>
      <ul>
        <li>ACTIVE, JPY, interestrate=0</li>
        <li>全体を管理するために、普通口座もdepositとして登録</li>
      </ul>
      <li>unsafe (deposit): {{ unsafedeposit5.toLocaleString() }}</li>
      <li>unsafe (trust): {{ unsafetrust5.toLocaleString() }}</li>
    </ul>
    <ul>
      <li>total: {{ total5.toLocaleString() }}</li>
      <li>rate (unsafe/total): {{ rate5.toLocaleString() }}</li>
    </ul>

    <button class="btn btn-primary" @click="calc5()">calc</button>

    <hr />
    <h3>Check profit and loss</h3>
    <br />
    deposit Diff: {{ this.depositDiff.toLocaleString() }}
    <br />
    <br />
    deposit active: {{ this.depositActive.toLocaleString() }}
    <br />
    value Account: {{ this.valueAccount.toLocaleString() }}
    <br />
    value tb: {{ this.valueTB.toLocaleString() }}
    <br />
    <br />
    total (deposit active + value account + value tb):
    {{ this.pl2.toLocaleString() }}
    <br />
    <button class="btn btn-primary" @click="calc2()">calc</button>

    <hr />
    <h3>check profit and loss for fc</h3>
    <ul>
      <li>外貨をいつ円に戻せばいいか確認用。</li>
      <li>事前にtrust balanceの更新が必要。</li>
    </ul>
    USD:
    <input type="number" step="0.01" class="form-control" v-model="fc.USD" />
    AUD:
    <input type="number" step="0.01" class="form-control" v-model="fc.AUD" />
    NZD:
    <input type="number" step="0.01" class="form-control" v-model="fc.NZD" />
    EUR:
    <input type="number" step="0.01" class="form-control" v-model="fc.EUR" />
    JPY:
    <input type="number" step="0.01" class="form-control" v-model="fc.JPY" />

    <br />
    deposit Diff: {{ this.depositDiffFc.toLocaleString() }}
    <br />
    <br />
    deposit active: {{ this.depositActiveFc.toLocaleString() }}
    <br />
    value Account: {{ this.valueAccountFc.toLocaleString() }}
    <br />
    value tb: {{ this.valueTBFc.toLocaleString() }}
    <br />
    <br />
    total (deposit active + value account + value tb):
    {{ this.pl6.toLocaleString() }}
    <br />
    <button class="btn btn-primary" @click="calc6()">calc6</button>

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
        >
        <!--
        -->
      </tbody>
    </table>
    <hr />

    <br />
    <form @submit.prevent="calc3">
      <input type="submit" value="Submit" />

      <div class="mb-3">
        <label for="" class="form-label">year</label>
        <input type="text" class="form-control" v-model="year3" />
      </div>
      <div class="mb-3">
        <label for="" class="form-label">month</label>
        <input type="text" class="form-control" v-model="month3" />
      </div>
    </form>

    deposite active: {{ this.depositActive3.toLocaleString() }}
    <br />
    valueAccount: {{ this.valueAccount3.toLocaleString() }}
    <br />
    value tb: {{ this.valueTB3.toLocaleString() }}
    <br />
    <br />
    total: {{ this.pl3.toLocaleString() }}

    <hr />
    <button class="btn btn-primary" @click="getData()">表示</button>

    <hr />
    principal: {{ this.principal.toLocaleString() }}
    <br />
    - deposit: {{ this.principalDeposit.toLocaleString() }}
    <br />
    - trust transaction: {{ this.principalTrustTransaction.toLocaleString() }}
    <br />

    <br />

    evaluated value: {{ this.value.toLocaleString() }}
    <br />
    - active deposit: {{ this.valueDepositActive.toLocaleString() }}
    <br />
    - finished deposit jpy: {{ this.valueDepositFinished.toLocaleString() }}
    <br />
    - trust balance jpy: {{ this.valueTBJPY.toLocaleString() }}
    <br />
    - trust balance fc: {{ this.valueTBFC.toLocaleString() }}
    <br />
    - account fc: {{ this.valueAccountFC.toLocaleString() }}
    <br />
    - trust transaction: {{ this.valueTT.toLocaleString() }}
    <br />

    <br />

    profit and loss: {{ this.pl.toLocaleString() }}
    <br />
    <button class="btn btn-primary" @click="calc1()">calc</button>
    <br />
  </div>
</template>

<script>
import { API } from "aws-amplify";
import {
  listDeposits,
  listAccounts,
  listTrustTransactions,
  listTrustBalances,
} from "../graphql/queries";

//import { listDeposits } from "../../graphql/queries";
//import { deleteDeposit } from "../../graphql/mutations";

import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "DepositIndex",

  async created() {},
  data() {
    return {
      //albums: [],
      deposits: [],

      apiName: "apif8da427c",

      path: "/summary",
      id: "",
      name: "",
      text: "",

      principal: 0,
      principalDeposit: 0,
      principalTrustTransaction: 0,

      value: 0,
      pl: 0,

      valueDepositActive: 0,
      valueDepositFinished: 0,
      valueTBJPY: 0,
      valueTBFC: 0,
      valueAccountFC: 0,
      valueTT: 0,

      depositActive: 0,
      depositDiff: 0,
      valueAccount: 0,

      valueTB: 0,
      pl2: 0,

      year3: 2000,
      month3: 1,
      depositActive3: 0,
      valueAccount3: 0,
      valueTB3: 0,
      pl3: 0,

      //---
      evals4: [],

      checkedCurrencys: ["jpy", "fc"],

      dactive4: 0,
      vaccount4: 0,
      total4: 0,

      safe5: 0,
      unsafedeposit5: 0,
      unsafetrust5: 0,
      total5: 0,
      rate5: 0,

      //---calc6
      fc: { USD: 110, AUD: 80, NZD: 80, EUR: 130, JPY: 1 },

      depositActiveFc: 0,
      depositDiffFc: 0,
      valueAccountFc: 0,

      valueTBFc: 0,
      pl6: 0,
    };
  },
  methods: {
    getData: function () {
      // 検索ID指定
      const path = this.path + "/" + this.text;
      // オプション
      const myInit = {
        headers: {},
        response: true,
      };
      // データ取得
      API.get(this.apiName, path, myInit).then((response) => {
        console.log(response);

        // テーブル表示
        this.items = [
          {
            id: response.data[0].id,
            name: response.data[0].name,
          },
        ];
      });
      //.catch((error) => {
      // テーブルリセット
      //  this.items = [];
      //});
    },

    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    async getDeposits() {
      await API.graphql({
        query: listDeposits,
      })
        .then((result) => {
          console.log(result);
          this.deposits = result.data.listDeposits.items;
          //this.Deposits = result.data.listDeposits.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async calc1() {
      //this.getDeposits();

      //this.principal = 1;
      //calc principal--------
      //calc value---------
      var principal = 0;
      var principalDeposit = 0;
      var principalTrustTransaction = 0;

      var value = 0;

      var valueDepositActive = 0;
      var valueDepositFinished = 0;
      var valueTBJPY = 0;
      var valueTBFC = 0;
      var valueAccountFC = 0;
      var valueTT = 0;

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

        //principal---
        //console.log("---20", d);
        if (d.principalAccount.currency == Enum.EnumCurrency.JPY.val) {
          //console.log("---21", d);
          principal += d.principal;
          principalDeposit += d.principal;
        }

        //value-------
        //value - deposit----
        if (d.status == Enum.EnumDepositStatus.ACTIVE.val) {
          if (d.principalAccount.currency == Enum.EnumCurrency.JPY.val) {
            value += d.principal;
            valueDepositActive += d.principal;
          } else {
            //foreign, evaluate with exchange rate---
            const exrate = dAccounts[d.principalAccount.currency].exchangeRate;
            //console.log("---------2");
            value += exrate * d.principal;
            valueDepositActive += exrate * d.principal;
          }
        } else {
          if (d.valueAccount.currency == Enum.EnumCurrency.JPY.val) {
            value += d.value;
            valueDepositFinished += d.value;
          }
        }
      }

      //value - account----
      for (const ka in accounts) {
        const a = accounts[ka];
        if (a.currency != Enum.EnumCurrency.JPY.val) {
          value += a.balance * a.exchangeRate;
          valueAccountFC += a.balance * a.exchangeRate;
          //console.log("------3");
          //console.log(a.balance * a.exchangeRate);
        }
      }

      // principal, value - trust transaction----
      var trusttransactions = {};
      await API.graphql({
        query: listTrustTransactions,
      })
        .then((result) => {
          console.log(result);
          trusttransactions = result.data.listTrustTransactions.items;
        })
        .catch((error) => {
          console.log(error);
        });

      for (const ktt in trusttransactions) {
        const tt = trusttransactions[ktt];
        if (tt.account.currency == Enum.EnumCurrency.JPY.val) {
          if (tt.tradeType == Enum.EnumTradeType.BUY.val) {
            //console.log("-------1");
            //console.log(tt);
            principal += tt.buy;
            principalTrustTransaction += tt.buy;
          } else {
            value += tt.sell;
            valueTT += tt.sell;
            value += tt.dividend;
            valueTT += tt.dividend;
          }
        }
      }

      // value - trust balance----
      var trustbalances = {};
      await API.graphql({
        query: listTrustBalances,
      })
        .then((result) => {
          console.log(result);
          trustbalances = result.data.listTrustBalances.items;
          //this.TrustBalances = result.data.listTrustBalances.items;
        })
        .catch((error) => {
          console.log(error);
        });
      //console.log(trustbalances);

      for (const ktb in trustbalances) {
        const tb = trustbalances[ktb];
        if (tb.currency == Enum.EnumCurrency.JPY.val) {
          value += tb.balance;
          valueTBJPY += tb.balance;
        } else {
          //foreign currency
          value += tb.balance * dAccounts[tb.currency].exchangeRate;
          valueTBFC += tb.balance * dAccounts[tb.currency].exchangeRate;
        }
      }
      //console.log(principal);
      this.principal = principal;
      this.principalDeposit = principalDeposit;
      this.principalTrustTransaction = principalTrustTransaction;

      this.value = value;
      this.valueDepositActive = valueDepositActive;
      this.valueDepositFinished = valueDepositFinished;
      this.valueTBJPY = valueTBJPY;
      this.valueTBFC = valueTBFC;
      this.valueAccountFC = valueAccountFC;
      //console.log("-----6",valueTT);
      this.valueTT = valueTT;

      this.pl = this.value - this.principal;
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
    async calc3() {
      //calc principal--------
      //calc value---------
      // var principal = 0;
      //var principalDeposit = 0;
      //var principalTrustTransaction = 0;

      //var value = 0;

      /*
    var valueDepositActive = 0;
    //var valueDepositFinished = 0;
    var valueTBJPY = 0;
    var valueTBFC = 0;
    var valueAccountFC = 0;
    var valueTT = 0;
    */

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
        a.balance = 0;
        dAccounts[a.id] = a;
      }
      //console.log("-------123");
      //console.log(dAccounts);

      //get deposits----

      var deposits;

      const sdate = this.year3 + "/" + this.month3 + "/01";
      const ddate = new Date(sdate);
      //console.log("----2", sdate, ddate);

      let filter = {
        date: {
          ge: ddate, // filter priority = 1
        },
      };
      //await API.graphql({ query: listProducts, variables: { filter: filter}}));
      await API.graphql({
        query: listDeposits,
        variables: { filter: filter },
      })
        .then((result) => {
          //console.log("----31", result);
          //console.log(result);
          deposits = result.data.listDeposits.items;
        })
        .catch((error) => {
          console.log(error);
        });

      //update account balance---

      for (const kd in deposits) {
        const d = deposits[kd];

        dAccounts[d.principalAccountId].balance -= d.principal;

        //console.log("----3", d.date);
        if (d.status == "FINISHED") {
          dAccounts[d.valueAccountId].balance += d.value;
        } else {
          //console.log("----31", );
          const exrate = dAccounts[d.principalAccountId].exchangeRate;

          depositActive += exrate * d.principal;
        }

        //principal---
        //console.log("---20", d);
        /*
        if (d.principalAccount.currency == Enum.EnumCurrency.JPY.val) {
          //console.log("---21", d);
          principal += d.principal;
          principalDeposit += d.principal;
        }
*/
      }

      //value - account----
      for (const ka in accounts) {
        const a = accounts[ka];
        //if (a.currency != Enum.EnumCurrency.JPY.val) {
        //value += a.balance * a.exchangeRate;
        valueAccount += a.balance * a.exchangeRate;
        //console.log("------3");
        //console.log(a.balance * a.exchangeRate);
        //}
      }

      console.log("---1", dAccounts);

      console.log("deposit active:", depositActive);
      console.log("value account:", valueAccount);

      // principal, value - trust transaction----

      // value - trust balance----

      this.depositActive3 = depositActive;
      this.depositDiff3 = depositDiff;
      this.valueAccount3 = valueAccount;

      this.valueTB3 = valueTB;

      this.pl3 = depositActive + valueAccount + valueTB;
    },
    async calc4() {
      //calc principal--------
      //calc value---------
      // var principal = 0;
      //var principalDeposit = 0;
      //var principalTrustTransaction = 0;

      //var value = 0;

      /*
    var valueDepositActive = 0;
    //var valueDepositFinished = 0;
    var valueTBJPY = 0;
    var valueTBFC = 0;
    var valueAccountFC = 0;
    var valueTT = 0;
    */

      //console.log("-----111");

      //      var valueTB = 0;

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

      //for every year from 2005- -----

      var evals4 = [];

      this.dactive4 = 0;
      this.vaccount4 = 0;
      this.total4 = 0;

      //for (let year = 2008; year < 2010; year++) {
      for (let year = 2007; year < 2024; year++) {
        //console.log("year;", year);

        var depositActive = 0;
        var valueAccount = 0;

        const dAccounts = [];
        for (const ka in accounts) {
          const a = accounts[ka];
          a.balance = 0;

          //

          if (this.checkedCurrencys.length == 2) {
            dAccounts[a.id] = a;
          } else {
            if (this.checkedCurrencys.includes("jpy")) {
              if (a.currency == "JPY") {
                dAccounts[a.id] = a;
              }
            } else {
              dAccounts[a.id] = a;
            }
          }
          /*
          if (this.checkedCurrencys.includes("jpy")) {
            if (a.currency == "JPY") {
              dAccounts[a.id] = a;
            }
          }
          if (this.checkedCurrencys.includes("fc")) {
            if (a.currency != "JPY") {
              console.log("-----222");
              dAccounts[a.id] = a;
            }
          }
          */
        }
        //console.log("-------123");
        //console.log(dAccounts);

        //get deposits----

        var deposits = [];
        var deposits0;

        const sdate = year + "/01/01";
        const dsdate = new Date(sdate);
        const edate = year + 1 + "/01/01";
        const dedate = new Date(edate);
        //console.log("----2", dsdate, dedate);

        let filter = {
          date: {
            ge: dsdate, // filter priority = 1
            lt: dedate, // filter priority = 1
          },
        };
        //await API.graphql({ query: listProducts, variables: { filter: filter}}));
        await API.graphql({
          query: listDeposits,
          variables: { filter: filter },
        })
          .then((result) => {
            //console.log("----31", result);
            //console.log(result);
            deposits0 = result.data.listDeposits.items;
          })
          .catch((error) => {
            console.log(error);
          });

        //update account balance---

        for (const kd in deposits0) {
          const d = deposits0[kd];
          if (this.checkedCurrencys.length == 2) {
            deposits.push(d);
          } else if (this.checkedCurrencys.length == 1) {
            if (this.checkedCurrencys.includes("jpy")) {
              //console.log("-----4", d.principalAccount);
              if (d.principalAccount.currency == "JPY") {
                if (d.status == "FINISHED") {
                  if (d.valueAccount.currency == "JPY") {
                    deposits.push(d);
                  }
                } else {
                  deposits.push(d);
                }
                //console.log("-----41", d.valueAccount);
              }
            } else {
              //console.log("-----5", d.principalAccount);
              if (d.status == "FINISHED") {
                if (
                  d.principalAccount.currency != "JPY" ||
                  d.valueAccount.currency != "JPY"
                ) {
                  deposits.push(d);
                }
              } else {
                if (d.principalAccount.currency != "JPY") {
                  deposits.push(d);
                }
              }

              //
              /*
              if (d.principalAccount.currency != "JPY") {
                if (d.status == "FINISHED") {
                  if (d.valueAccount.currency != "JPY") {
                    deposits.push(d);
                  }
                } else {
                  deposits.push(d);
                }
                //console.log("-----51", d.valueAccount);
              }
              */
            }
          }
        }
        //
        //console.log("----6", deposits);
        for (const kd in deposits) {
          const d = deposits[kd];

          dAccounts[d.principalAccountId].balance -= d.principal;

          //console.log("----3", d.date);
          if (d.status == "FINISHED") {
            dAccounts[d.valueAccountId].balance += d.value;
          } else {
            //console.log("----31", );
            const exrate = dAccounts[d.principalAccountId].exchangeRate;

            depositActive += exrate * d.principal;
          }
        }

        //value - account----
        for (const ka in accounts) {
          const a = accounts[ka];
          //if (a.currency != Enum.EnumCurrency.JPY.val) {
          //value += a.balance * a.exchangeRate;
          valueAccount += a.balance * a.exchangeRate;
          //console.log("------3");
          //console.log(a.balance * a.exchangeRate);
          //}
        }

        //value - tb
        /*
        var trustbalances = {};
        await API.graphql({
          query: listTrustBalances,
        })
          .then((result) => {
            console.log(result);
            trustbalances = result.data.listTrustBalances.items;
            //this.TrustBalances = result.data.listTrustBalances.items;
          })
          .catch((error) => {
            console.log(error);
          });
        //console.log(trustbalances);

        for (const ktb in trustbalances) {
          const tb = trustbalances[ktb];
          //if (tb.currency == Enum.EnumCurrency.JPY.val) {
          //          value += tb.balance;
          //valueTBJPY += tb.balance;
          //} else {
          //foreign currency
          //   value += tb.balance * dAccounts[tb.currency].exchangeRate;
          valueTB += tb.balance * dAccounts[tb.currency].exchangeRate;
          //        }
        }
*/
        var e = {
          year: year,
          dactive: depositActive,
          vaccount: valueAccount,
          total: depositActive + valueAccount,
        };
        //evals4[year] = e;
        evals4.push(e);

        this.dactive4 += depositActive;
        this.vaccount4 += valueAccount;
        this.total4 += depositActive + valueAccount;
      }

      //      console.log("---1", evals4);
      this.evals4 = evals4;

      //      console.log("deposit active:", depositActive);
      //console.log("value account:", valueAccount);

      // principal, value - trust transaction----

      // value - trust balance----

      //this.depositActive3 = depositActive;
      //this.depositDiff3 = depositDiff;
      //this.valueAccount3 = valueAccount;

      //      this.valueTB3 = valueTB;

      //this.pl3 = depositActive + valueAccount + valueTB;
    },
    async calc5() {
      var safe5 = 0;
      var unsafedeposit5 = 0;
      var unsafetrust5 = 0;

      //console.log("-----111");

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

      //console.log("----1", dAccounts);

      //deposit----
      var deposits0;

      await API.graphql({
        query: listDeposits,
      })
        .then((result) => {
          //console.log(result);
          deposits0 = result.data.listDeposits.items;
        })
        .catch((error) => {
          console.log(error);
        });

      //update account balance---
      for (const kd in deposits0) {
        const d = deposits0[kd];

        if (d.status == "ACTIVE") {
          if (d.interestRate == 0 && d.principalAccount.currency == "JPY") {
            safe5 += d.principal;
          } else {
            const exrate = dAccounts[d.principalAccount.currency].exchangeRate;
            unsafedeposit5 += exrate * d.principal;
          }
        }
      }
      //console.log("----6", safe5);

      //unsafe trust-----
      var trustbalances = {};
      await API.graphql({
        query: listTrustBalances,
      })
        .then((result) => {
          console.log(result);
          trustbalances = result.data.listTrustBalances.items;
        })
        .catch((error) => {
          console.log(error);
        });
      //console.log(trustbalances);

      for (const ktb in trustbalances) {
        const tb = trustbalances[ktb];
        if (tb.currency == Enum.EnumCurrency.JPY.val) {
          unsafetrust5 += tb.balance;
        } else {
          //foreign currency
          unsafetrust5 += tb.balance * dAccounts[tb.currency].exchangeRate;
        }
      }

      this.safe5 = safe5;
      this.unsafedeposit5 = unsafedeposit5;
      this.unsafetrust5 = unsafetrust5;

      this.total5 = safe5 + unsafedeposit5 + unsafetrust5;
      this.rate5 = (unsafedeposit5 + unsafetrust5) / this.total5;
    },

    async calc6() {
      var depositActiveFc = 0;
      var depositDiffFc = 0;
      var valueAccountFc = 0;

      var valueTBFc = 0;

      //console.log(this.fc);

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

      // create dic----
      var dicAccountIdBalance = [];
      for (const a in accounts) {
        dicAccountIdBalance[accounts[a].id] = 0;
      }


   

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
          if (d.principalAccount.currency != "JPY") {
            //const exrate = dAccounts[d.principalAccount.currency].exchangeRate;
            //depositActiveFc += exrate * d.principal;
            dicAccountIdBalance[d.principalAccountId] -= d.principal;

            const exrate = this.fc[d.principalAccount.currency];
            //console.log("----01", exrate);
            depositActiveFc += exrate * d.principal;
          }
        } else {
          if (
            d.principalAccount.currency != "JPY" ||
            d.valueAccount.currency != "JPY"
          ) {
            dicAccountIdBalance[d.principalAccountId] -= d.principal;
            dicAccountIdBalance[d.valueAccountId] += d.value;
            /*
            const exratePri =
              dAccounts[d.principalAccount.currency].exchangeRate;
            const exrateVal = dAccounts[d.valueAccount.currency].exchangeRate;
            depositDiffFc += d.value * exrateVal - d.principal * exratePri;
            */
          }
        }
      }

      //console.log("---1", dicAccountIdBalance);

      var trusttransactions = {};
      await API.graphql({
        query: listTrustTransactions,
      })
        .then((result) => {
          console.log(result);
          trusttransactions = result.data.listTrustTransactions.items;
        })
        .catch((error) => {
          console.log(error);
        });
      //console.log(trusttransactions);

      for (const ktt in trusttransactions) {
        const tt = trusttransactions[ktt];

        if (tt.account.currency != "JPY") {
          if (tt.tradeType == Enum.EnumTradeType.BUY.val) {
            dicAccountIdBalance[tt.accountId] -= tt.buy;
            //          console.log("------31", tt.buy);
          } else if (tt.tradeType == Enum.EnumTradeType.SELL.val) {
            dicAccountIdBalance[tt.accountId] += tt.sell;
            //        console.log("------32", tt.sell);
          } else if (tt.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
            dicAccountIdBalance[tt.accountId] += tt.dividend;
            //      console.log("------33", tt);
          }
        }
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
        //console.log("----41", tb);
        if (tb.currency != "JPY") {
          valueTBFc += tb.balance * this.fc[tb.currency];
        }
      }

      //value - account----
      for (const ka in accounts) {
        const a = accounts[ka];

        const balance = dicAccountIdBalance[a.id];

        //console.log("----1", a.currency);
        //console.log("----11", this.fc[a.currency]);

        valueAccountFc += balance * this.fc[a.currency];
        //        valueAccountFc += a.balance * a.exchangeRate;
        //console.log("------3", valueAccount, a);
      }
      //console.log("---2", valueAccountFc);

      this.depositDiffFc = depositDiffFc;

      this.depositActiveFc = depositActiveFc;
      this.valueAccountFc = valueAccountFc;
      this.valueTBFc = valueTBFc;

      this.pl6 = depositActiveFc + valueAccountFc + valueTBFc;
    },
  },
};
</script>