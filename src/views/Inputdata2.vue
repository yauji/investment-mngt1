<template>
  <div>
    <h1>Inputdata2</h1>

    <h3>deposit finished</h3>
    <br />

    plus xxx interest rate xxx duration

    <form @submit.prevent="submitCreate">
      <div class="mb-3">
        <label for="" class="form-label">principal account</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.principalAccountId"
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">value account</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.valueAccountId"
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">deposit jpy finished</label>
        <textarea class="form-control" v-model="form.dataDJF" />
      </div>

      <!--
-->

      <input type="submit" value="Submit" />
    </form>

    <hr />

    <h3>deposit active</h3>
    <br />

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

    <form @submit.prevent="submitCreateActive">
      <div class="mb-3">
        <label for="" class="form-label">principal account</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.principalAccountId"
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">deposit active</label>
        <textarea class="form-control" v-model="form.dataDA" />
      </div>

      <input type="submit" value="Submit" />
    </form>

    <br />

    <hr />
    <h3>trust transaction buy (rakuten)</h3>
    <br />

    <form @submit.prevent="submitCreateTrustTransactionBuy">
      <div class="mb-3">
        <label for="" class="form-label">principal account</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.principalAccountId"
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">trust balance *</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.trustBalanceId"
          required
        >
          <option v-for="n in trustbalances" v-bind:key="n" v-bind:value="n.id">
            {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">trust transaction buy</label>
        <textarea class="form-control" v-model="form.dataTTBuy" />
      </div>

      <input type="submit" value="Submit" />
    </form>





    <br />

    <hr />
    <h3>trust transaction buy (monex)</h3>
    <br />

    <form @submit.prevent="submitCreateTrustTransactionBuyM">
      <div class="mb-3">
        <label for="" class="form-label">principal account</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.principalAccountId"
        >
          <option v-for="n in this.accounts" v-bind:key="n" v-bind:value="n.id">
            {{ n.currency }} - {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">trust balance *</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.trustBalanceId"
          required
        >
          <option v-for="n in trustbalances" v-bind:key="n" v-bind:value="n.id">
            {{ n.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">trust transaction buy</label>
        <textarea class="form-control" v-model="form.dataTTBuyM" />
      </div>

      <input type="submit" value="Submit" />
    </form>

    <br />
  </div>
</template>

<script>
import { API } from "aws-amplify";
//import { listAccounts } from "../graphql/queries";

import { listTrustBalances, listAccounts } from "../graphql/queries";
//listDeposits,//listTrustTransactions,
//listTrustBalances,

import { createDeposit, createTrustTransaction, createAccount } from "../graphql/mutations";

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
      for (const r of rows) {
        // ホワイトリストでCreateAccountInputを構築
        const input = {};
        // idはCSVにあれば採用（任意）
        if (r.id && String(r.id).trim() !== '') input.id = String(r.id).trim();
        if (r.name) input.name = String(r.name).trim();
        if (r.currency) input.currency = String(r.currency).trim();
        if (r.memo !== undefined) input.memo = String(r.memo);
        // 数値項目
        const bal = Number(r.balance);
        if (!Number.isNaN(bal)) input.balance = bal;
        const rate = Number(r.exchangeRate);
        if (!Number.isNaN(rate)) input.exchangeRate = rate;
        // 空の必須項目チェック（name/currencyが無い場合はスキップ）
        if (!input.name || !input.currency) {
          console.warn("skip row (name/currency missing):", r);
          continue;
        }
        try {
          const res = await API.graphql({
            query: createAccount,
            variables: { input },
          });
          console.log("created account:", res?.data?.createAccount?.id || input.id);
        } catch (e) {
          console.error("createAccount failed:", e, r);
        }
      }
      // 取り込み後に一覧を更新
      await this.getAccounts();
      alert("Accounts CSV import finished.");
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