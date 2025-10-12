<template>
  <div>
    <h1>Inputdata2 - DBからの復旧用</h1>


    <hr />
    <h3>accounts (CSV)</h3>
    <p>ヘッダ付きCSVを貼り付けてください（id,name,currency,balance,exchangeRate,memo を取り込みます）。</p>
    <form @submit.prevent="submitCreateAccountsFromCSV">
      <div class="mb-3">
        <label for="" class="form-label">accounts CSV</label>
        <textarea class="form-control" rows="6" v-model="form.dataAccounts" placeholder='"id","__typename","balance","createdAt","currency","exchangeRate","memo","name","owner","updatedAt"
"cb792f3a-52b3-41e8-a5bb-5fa249c1f51a","Account","1895.18","2021-06-25T15:51:05.261Z","NZD","79","","rakuten","...","2025-02-23T22:46:14.530Z"' />
      </div>
      <input type="submit" value="Import Accounts" />
    </form>



    <br />

    <hr />
    <h3>deposits (CSV)</h3>
    <p>ヘッダ付きCSVを貼り付けてください（id,date,endDate,duration,interestRate,exchangeRate,principal,value,status,memo,name,principalAccountId,valueAccountId を取り込みます）。</p>
    <form @submit.prevent="submitCreateDepositsFromCSV">
      <div class="mb-3">
        <label for="" class="form-label">deposits CSV</label>
        <textarea class="form-control" rows="6" v-model="form.dataDeposits" placeholder='"id","__typename","createdAt","date","duration","endDate","exchangeRate","interestRate","memo","name","owner","principal","principalAccountId","status","updatedAt","value","valueAccountId"
  "414b9b00-c847-4de5-a6e2-6591a2dcacd3","Deposit","2021-06-25T07:54:11.909Z","2020-06-05T15:00:00.000Z","0","2020-07-10T15:00:00.000Z","0","0","金利：0.03%","""２週間満期預金 ""","3b5c64d1-5ddc-4064-a4e4-23f4ae07acdd","6000000","3b0e7f98-e2f0-4dc9-9076-28c2a20019fa","FINISHED","2021-06-25T07:54:11.909Z","6000113","3b0e7f98-e2f0-4dc9-9076-28c2a20019fa"' />
      </div>
      <input type="submit" value="Import Deposits" />
    </form>


    <hr />
<h3>trust balances (CSV)</h3>
<p>ヘッダ付きCSVを貼り付けてください（id,name,currency,noItem,basicPrice,balance[,memo] を取り込みます）。</p>
<form @submit.prevent="submitCreateTrustBalancesFromCSV">
  <div class="mb-3">
    <label for="" class="form-label">trust balances CSV</label>
    <textarea class="form-control" rows="6" v-model="form.dataTrustBalances" placeholder='"id","__typename","balance","basicPrice","createdAt","currency","name","noItem","owner","updatedAt"
"65d25a84-4b6f-4e1f-9307-97b92fbee4c3","TrustBalance","995.38","314","2021-06-25T13:59:50.693Z","USD","ジャナス・セレクション ジャナス・バランス・ファンドクラスA（米ドル）受益証券（愛称：全天候型）","3.17","3b5c64d1-5ddc-4064-a4e4-23f4ae07acdd","2025-02-22T22:52:43.575Z"' />
  </div>
  <input type="submit" value="Import TrustBalances" />
</form>


<hr />
<h3>trust transactions (CSV)</h3>
<p>ヘッダ付きCSVを貼り付けてください（id,accountId,trustBalanceId,tradeType,date,basicPrice,noItem,buy,sell,dividend を取り込みます）。</p>
<form @submit.prevent="submitCreateTrustTransactionsFromCSV">
  <div class="mb-3">
    <label for="" class="form-label">trust transactions CSV</label>
    <textarea class="form-control" rows="6" v-model="form.dataTrustTransactions" placeholder='"id","__typename","accountId","basicPrice","buy","createdAt","date","dividend","noItem","owner","sell","tradeType","trustBalanceId","updatedAt"
"6385916f-cdbb-4e68-8c00-80d49e70378d","TrustTransaction","3b0e7f98-e2f0-4dc9-9076-28c2a20019fa","17307","100000","2023-05-02T21:36:51.644Z","2021-12-16T15:00:00.000Z","","5.7781","3b5c64d1-5ddc-4064-a4e4-23f4ae07acdd","","BUY","0ed32f0f-c36a-42ca-83a2-2be1f6ad8e3b","2023-05-02T21:36:51.644Z"
"3e008a30-8265-4c2d-a04c-029fd123446d","TrustTransaction","3bfc30e4-5d2f-4447-97f7-70b78290c7e1","14603","40000","2023-05-02T21:08:52.300Z","2022-05-09T15:00:00.000Z","","2.7392","3b5c64d1-5ddc-4064-a4e4-23f4ae07acdd","","BUY","66393a2c-bee5-4dc7-9b15-8eed808a5ee6","2023-05-02T21:08:52.300Z"' />
  </div>
  <input type="submit" value="Import TrustTransactions" />
</form>





  </div>
</template>

<script>
import { API } from "aws-amplify";
//import { listAccounts } from "../graphql/queries";

import { listTrustBalances, listAccounts } from "../graphql/queries";
//listDeposits,//listTrustTransactions,
//listTrustBalances,

//import { createDeposit, createTrustTransaction, createAccount } from "../graphql/mutations";
import { createDeposit, createTrustTransaction, createAccount, createTrustBalance } from "../graphql/mutations";

//import { listDeposits } from "../../graphql/queries";
//import { deleteDeposit } from "../../graphql/mutations";

//import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "DepositIndex",
  async created() {
    //this.getDeposits();
    this.getAccounts();
    this.getTrustBalances();
  },
  data() {
    return {
      form: {
        dataDJF: "",
        dataAccounts: "",
        dataDeposits: "",
        dataTrustBalances: "",
        dataTrustTransactions: "",
      },
      apiName: "apif8da427c",

      path: "/inputdata",
      accounts: [],
      trustbalances: [],
    };
  },
  methods: {
    // CSVの1行をクォート考慮で分割
    splitCsvLine(line) {
      const out = [];
      let cur = '';
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i + 1] === '"') { // エスケープされた二重引用符
            cur += '"';
            i++;
          } else {
            inQ = !inQ;
          }
        } else if (ch === ',' && !inQ) {
          out.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out.map(s => s.replace(/^"(.*)"$/, '$1')); // 外側の引用符を除去
    },
    // CSV全文を配列オブジェクトに変換
    parseAccountsCsv(text) {
      if (!text) return [];
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
      if (lines.length === 0) return [];
      const header = this.splitCsvLine(lines[0]).map(h => h.trim());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = this.splitCsvLine(lines[i]);
        const row = {};
        for (let j = 0; j < header.length; j++) {
          row[header[j]] = cols[j] !== undefined ? cols[j] : '';
        }
        rows.push(row);
      }
      return rows;
    },
    // deposits 用CSVパース（ヘッダベース・クォート対応）
    parseDepositsCsv(text) {
      if (!text) return [];
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
      if (lines.length === 0) return [];
      const header = this.splitCsvLine(lines[0]).map(h => h.trim());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = this.splitCsvLine(lines[i]);
        const row = {};
        for (let j = 0; j < header.length; j++) {
          row[header[j]] = cols[j] !== undefined ? cols[j] : '';
        }
        rows.push(row);
      }
      return rows;
    },
    // trust balances 用CSVパース（ヘッダベース・クォート対応）
parseTrustBalancesCsv(text) {
  if (!text) return [];
  const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = this.splitCsvLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = this.splitCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cols[j] !== undefined ? cols[j] : '';
    }
    rows.push(row);
  }
  return rows;
},

// trust transactions 用CSVパース（ヘッダベース・クォート対応）
parseTrustTransactionsCsv(text) {
  if (!text) return [];
  const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = this.splitCsvLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = this.splitCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cols[j] !== undefined ? cols[j] : '';
    }
    rows.push(row);
  }
  return rows;
},

    async submitCreate() {
      //console.log("----11");
      //console.log("xxxxxxxx", this.form.dataDJF);

      const str = this.form.dataDJF;

      var arr = str.split(/\r\n|\n/);

      for (var i = 0; i < arr.length; i++) {
        //console.log(arr[i]);
        var arr2 = arr[i].split(/xxx/);
        for (const k2 in arr2) {
          console.log(k2, arr2[k2]);
        }
        /*
         */
        var form = {};

        //form.depositType = "DEPOSIT_JPY";

        form.date = new Date(arr2[0]);
        form.name = arr2[1];
        form.memo = arr2[7];
        form.principal = parseFloat(arr2[16].replace(/,/g, ""));
        form.exchangeRate = 0;
        form.interestRate = parseFloat(arr2[18].replace(/,/g, ""));
        form.duration = parseFloat(arr2[19].replace(/,/g, ""));
        form.endDate = new Date(arr2[12]);
        form.value = parseFloat(arr2[17].replace(/,/g, ""));

        form.status = "FINISHED";

        //console.log("---13", this.form.accountId);

        form.principalAccountId = this.form.principalAccountId;
        form.valueAccountId = this.form.valueAccountId;

        //console.log(this.form.date);
        console.log("------", form);

        await API.graphql({
          query: createDeposit,
          variables: { input: form },
        })
          .then((result) => {
            console.log(result);
            //this.$router.push({ name: "DepositIndex" });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },

    // Accounts CSV 取り込み（単独メソッドとして定義）
    async submitCreateAccountsFromCSV() {
      const rows = this.parseAccountsCsv(this.form.dataAccounts);
      for (let idx = 0; idx < rows.length; idx++) {
        const r = rows[idx];
        // ホワイトリストでCreateAccountInputを構築
        const input = {};
        // idはCSVにあれば採用（任意）
        if (r.id && String(r.id).trim() !== '') input.id = String(r.id).trim();
        if (r.name) input.name = String(r.name).trim();
        if (r.currency) input.currency = String(r.currency).trim();
        if (r.memo !== undefined) input.memo = String(r.memo);

        // 必須（想定）：name / currency
        if (!input.name || !input.currency) {
          console.warn(`[account csv] skip row ${idx} (name/currency missing):`, r);
          continue;
        }

        // 数値項目（Float! 対応で必ず値を入れる）
        // balance: 空や非数は 0 にフォールバック
        let balRaw = r.balance !== undefined ? String(r.balance).trim() : '';
        let bal = Number(balRaw.replace(/,/g, ''));
        if (Number.isNaN(bal)) bal = 0;
        input.balance = bal;

        // exchangeRate: 空や非数は 通貨に応じて既定値（JPY=1, それ以外=0）にフォールバック
        let rateRaw = r.exchangeRate !== undefined ? String(r.exchangeRate).trim() : '';
        let rate = Number(rateRaw.replace(/,/g, ''));
        if (Number.isNaN(rate)) {
          rate = String(input.currency).toUpperCase() === 'JPY' ? 1 : 0;
        }
        input.exchangeRate = rate;

        try {
          const res = await API.graphql({
            query: createAccount,
            variables: { input },
          });
          console.log("created account:", res?.data?.createAccount?.id || input.id);
        } catch (e) {
          console.error(`[account csv] createAccount failed (row ${idx}):`, e, r);
        }
      }
      // 取り込み後に一覧を更新
      await this.getAccounts();
      alert("Accounts CSV import finished.");
    },

    // 日付文字列を安全に ISO8601 に変換（無効/空/0 は null を返す）
    toSafeISO(s) {
      if (s === undefined || s === null) return null;
      const t = String(s).trim();
      if (!t || t === "0" || t.toLowerCase() === "null" || t.toLowerCase() === "undefined") return null;
      const d = new Date(t);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString();
    },

    async submitCreateDepositsFromCSV() {
      const rows = this.parseDepositsCsv(this.form.dataDeposits);
      for (let idx = 0; idx < rows.length; idx++) {
        const r = rows[idx];
        try {
          // CreateDepositInput をホワイトリストで構築
          const input = {};
          if (r.id && String(r.id).trim() !== '') input.id = String(r.id).trim();
          if (r.name) input.name = String(r.name).trim();
          if (r.memo !== undefined) input.memo = String(r.memo);
          if (r.status) input.status = String(r.status).trim(); // e.g., FINISHED/ACTIVE

          // 口座IDはCSV優先、空ならフォーム選択値で補完
          const principalId = String(r.principalAccountId || this.form.principalAccountId || '').trim();
          if (principalId) input.principalAccountId = principalId;
          const valueId = String(r.valueAccountId || this.form.valueAccountId || '').trim();
          if (valueId) input.valueAccountId = valueId;

          // 日付は安全にパース（無効なら送らない）
          const dateISO = this.toSafeISO(r.date);
          if (dateISO) input.date = dateISO;
          const endISO = this.toSafeISO(r.endDate);
          if (endISO) input.endDate = endISO;

          // 数値系（空/無効は送らない）
          const principal = Number(r.principal);
          if (!Number.isNaN(principal)) input.principal = principal;
          const value = Number(r.value);
          if (!Number.isNaN(value)) input.value = value;
          const dur = Number(r.duration);
          if (!Number.isNaN(dur)) input.duration = dur;
          const ir = Number(r.interestRate);
          if (!Number.isNaN(ir)) input.interestRate = ir;
          const ex = Number(r.exchangeRate);
          if (!Number.isNaN(ex)) input.exchangeRate = ex;

          // バリデーション（必須想定: name, principalAccountId）
          if (!input.name || !input.principalAccountId) {
            console.warn(`[deposit csv] skip row ${idx} (required fields missing):`, r);
            continue;
          }

          const res = await API.graphql({
            query: createDeposit,
            variables: { input },
          });
          console.log("created deposit:", res?.data?.createDeposit?.id || input.id);
        } catch (e) {
          console.error(`[deposit csv] row ${idx} failed:`, e, r);
          // 続行（他行は処理する）
          continue;
        }
      }
      alert("Deposits CSV import finished.");
    },

    async submitCreateTrustBalancesFromCSV() {
  const rows = this.parseTrustBalancesCsv(this.form.dataTrustBalances);
  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    try {
      // CreateTrustBalanceInput をホワイトリストで構築
      const input = {};
      if (r.id && String(r.id).trim() !== '') input.id = String(r.id).trim();
      if (r.name) input.name = String(r.name).trim();
      if (r.currency) input.currency = String(r.currency).trim();
      if (r.memo !== undefined && r.memo !== null) input.memo = String(r.memo);
      // 数値項目
      const noItem = Number(r.noItem);
      if (!Number.isNaN(noItem)) input.noItem = noItem;
      const basicPrice = Number(r.basicPrice);
      if (!Number.isNaN(basicPrice)) input.basicPrice = basicPrice;
      const balance = Number(r.balance);
      if (!Number.isNaN(balance)) input.balance = balance;
      // バリデーション（必須想定: name, currency）
      if (!input.name || !input.currency) {
        console.warn(`[trustbalance csv] skip row ${idx} (name/currency missing):`, r);
        continue;
      }
      const res = await API.graphql({
        query: createTrustBalance,
        variables: { input },
      });
      console.log("created trustbalance:", res?.data?.createTrustBalance?.id || input.id);
    } catch (e) {
      console.error(`[trustbalance csv] row ${idx} failed:`, e, r);
      continue;
    }
  }
  // 取り込み後に一覧を更新
  await this.getTrustBalances();
  alert("TrustBalances CSV import finished.");
},


async submitCreateTrustTransactionsFromCSV() {
  const rows = this.parseTrustTransactionsCsv(this.form.dataTrustTransactions);
  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    try {
      // CreateTrustTransactionInput をホワイトリストで構築
      const input = {};
      if (r.id && String(r.id).trim() !== '') input.id = String(r.id).trim();

      // 必須想定
      if (r.accountId) input.accountId = String(r.accountId).trim();
      if (r.trustBalanceId) input.trustBalanceId = String(r.trustBalanceId).trim();
      if (r.tradeType) input.tradeType = String(r.tradeType).trim(); // BUY/SELL/DIVIDEND 等

      // 日付は安全に
      const dateISO = this.toSafeISO(r.date);
      if (dateISO) input.date = dateISO;

      // 数値項目
      const basicPrice = Number(r.basicPrice);
      if (!Number.isNaN(basicPrice)) input.basicPrice = basicPrice;
      const noItem = Number(r.noItem);
      if (!Number.isNaN(noItem)) input.noItem = noItem;
      const buy = Number(r.buy);
      if (!Number.isNaN(buy)) input.buy = buy;
      const sell = Number(r.sell);
      if (!Number.isNaN(sell)) input.sell = sell;
      const dividend = Number(r.dividend);
      if (!Number.isNaN(dividend)) input.dividend = dividend;

      // バリデーション
      if (!input.accountId || !input.trustBalanceId || !input.tradeType) {
        console.warn(`[trusttx csv] skip row ${idx} (required fields missing):`, r);
        continue;
      }

      const res = await API.graphql({
        query: createTrustTransaction,
        variables: { input },
      });
      console.log("created trust transaction:", res?.data?.createTrustTransaction?.id || input.id);
    } catch (e) {
      console.error(`[trusttx csv] row ${idx} failed:`, e, r);
      continue;
    }
  }
  alert("TrustTransactions CSV import finished.");
},

    // deposit active の取り込み（元の処理をこちらに格納）
    async submitCreateActive() {
      const str = this.form.dataDA;

      var arr = str.split(/\r\n|\n/);

      for (var i = 0; i < arr.length; i++) {
        var arr2 = arr[i].split(/xxx/);
        for (const k2 in arr2) {
          console.log(k2, arr2[k2]);
        }
        var form = {};

        form.date = new Date(arr2[0]);
        form.name = arr2[1];
        form.memo = arr2[7];
        form.principal = parseFloat(arr2[16].replace(/,/g, ""));
        form.exchangeRate = 0;
        form.interestRate = parseFloat(arr2[18].replace(/,/g, ""));
        form.duration = parseFloat(arr2[19].replace(/,/g, ""));

        form.status = "ACTIVE";

        form.principalAccountId = this.form.principalAccountId;

        console.log("---active---", form);

        await API.graphql({
          query: createDeposit,
          variables: { input: form },
        })
          .then((result) => {
            console.log(result);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    async submitCreateTrustTransactionBuy() {
      console.log("---11");
      const str = this.form.dataTTBuy;
      //console.log(str);

      var arr = str.split(/\r\n|\n/);

      for (var i = 0; i < arr.length; i++) {
        var arr2 = arr[i].split(/xxx/);
        for (const k2 in arr2) {
          console.log(k2, arr2[k2]);
        }
        var form = {};

        form.date = new Date(arr2[0]);
        form.tradeType = Enum.EnumTradeType.BUY.val;

        form.trustBalanceId = this.form.trustBalanceId;
        form.accountId = this.form.principalAccountId;

        form.basicPrice = parseFloat(arr2[8].replace(/,/g, ""));

        //hard code
        form.noItem = parseFloat(arr2[7].replace(/,/g, "")) / 10000;
        form.buy = parseFloat(arr2[12].replace(/,/g, ""));
        

        await API.graphql({
          query: createTrustTransaction,
          variables: { input: form },
        })
          .then((result) => {
            console.log(result);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    async submitCreateTrustTransactionBuyM() {
      console.log("---12");
      const str = this.form.dataTTBuyM;
      //console.log(str);
      var arr = str.split(/\r\n|\n/);

      for (var i = 0; i < arr.length; i++) {
        var arr2 = arr[i].split(/xxx/);
        for (const k2 in arr2) {
          console.log(k2, arr2[k2]);
        }
        var form = {};

        form.date = new Date(arr2[7]);
        form.tradeType = Enum.EnumTradeType.BUY.val;

        form.trustBalanceId = this.form.trustBalanceId;
        form.accountId = this.form.principalAccountId;

        form.basicPrice = parseFloat(arr2[10].replace(/,/g, ""));

        //hard code
        form.noItem = parseFloat(arr2[9].replace(/,/g, "")) / 10000;
        form.buy = parseFloat(arr2[12].replace(/,/g, "")) * -1;

        await API.graphql({
          query: createTrustTransaction,
          variables: { input: form },
        })
          .then((result) => {
            console.log(result);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    async getAccounts() {
      await API.graphql({
        query: listAccounts,
      })
        .then((result) => {
          console.log(result);
          this.accounts = result.data.listAccounts.items;
        })
        .catch((error) => {
          console.log(error);
        });
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
  },
};
</script>