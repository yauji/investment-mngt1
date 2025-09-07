<template>
  <div>
    <h1>Account detail - {{ form.name }} - {{ form.currency }}</h1>

    <h3>Deposites <small class="text-muted">(表示件数: {{ deposits.length }})</small></h3>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>name</th>
          <th>date</th>
          <th>status</th>
          <th>principal (expense)</th>
          <th></th>
          <th>value (income)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="deposit in deposits" :key="deposit.id">
          <td>{{ deposit.name }}</td>
          <td>{{ moment(deposit.date) }}</td>
          <td>{{ deposit.status }}</td>
          <td>{{ numberFormat(deposit.principal) }}</td>
          <td>{{ deposit.principalAccountName }}</td>
          <td>{{ numberFormat(deposit.value) }}</td>
          <td>{{ deposit.valueAccountName }}</td>
        </tr>
      </tbody>
    </table>

    <h3>
      Trust transactions
      <small class="text-muted">
        (表示件数: {{ pagedCount }} / 全 {{ trusttransactions.length }} 件)
      </small>
    </h3>
    <div class="d-flex align-items-center mb-2" style="gap:8px;">
      <button class="btn btn-sm btn-outline-secondary" @click="prevPage" :disabled="page<=1">Prev</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button class="btn btn-sm btn-outline-secondary" @click="nextPage" :disabled="page>=totalPages">Next</button>
      <span class="ms-3">per page:</span>
      <select class="form-select form-select-sm" style="width:auto;" v-model.number="perPage">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th @click="setSort('date')" style="cursor:pointer">date<span v-if="sortKey==='date'"> {{ sortAsc ? '▲' : '▼' }}</span></th>
          <th @click="setSort('tradeType')" style="cursor:pointer">type<span v-if="sortKey==='tradeType'"> {{ sortAsc ? '▲' : '▼' }}</span></th>
          <th @click="setSort('buy')" style="cursor:pointer">buy (expense)<span v-if="sortKey==='buy'"> {{ sortAsc ? '▲' : '▼' }}</span></th>
          <th @click="setSort('sell')" style="cursor:pointer">sell (income)<span v-if="sortKey==='sell'"> {{ sortAsc ? '▲' : '▼' }}</span></th>
          <th @click="setSort('dividend')" style="cursor:pointer">dividend (income)<span v-if="sortKey==='dividend'"> {{ sortAsc ? '▲' : '▼' }}</span></th>
          <th @click="setSort('trust')" style="cursor:pointer">trust<span v-if="sortKey==='trust'"> {{ sortAsc ? '▲' : '▼' }}</span></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="trusttransaction in pagedTrustTransactions"
          :key="trusttransaction.id"
        >
          <td>{{ moment(trusttransaction.date) }}</td>
          <td>{{ trusttransaction.tradeType }}</td>
          <td>{{ numberFormat(trusttransaction.buy) }}</td>
          <td>{{ numberFormat(trusttransaction.sell) }}</td>
          <td>{{ numberFormat(trusttransaction.dividend) }}</td>
          <td>{{ trustMap[trusttransaction.trustBalanceId] || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { getAccount } from "../../graphql/queries";
import {
  listAccounts,
  listDeposits,
  listTrustTransactions,
  listTrustBalances,
} from "../../graphql/queries";

//import { updateAccount } from "../../graphql/mutations";

//import Datepicker from "vue3-datepicker";

import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "AccountShow",
  props: {
    accountId: String,
  },
  async created() {
    //for display other account name
    await this.getAllAccounts();

    this.getAccount();
    this.getTrans();
  },
  data() {
    return {
      form: {},
      deposits: [],
      //for display other account name
      accounts: [],
      trusttransactions: [],
      trustMap: {}, // trustBalanceId -> name
      sortKey: 'date',
      sortAsc: false,
      page: 1,
      perPage: 20,
    };
  },

  methods: {
    numberFormat: function (value) {
      if (value == null) {
        return "---";
      } else {
        return value.toLocaleString();
      }
    },
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
    },
    async buildTrustMap() {
      try {
        const m = {};
        let nextToken = null;
        do {
          const res = await API.graphql({ query: listTrustBalances, variables: { limit: 100, nextToken } });
          const data = res?.data?.listTrustBalances;
          const items = data?.items || [];
          for (const tb of items) m[tb.id] = tb.name;
          nextToken = data?.nextToken || null;
        } while (nextToken);
        this.trustMap = m;
      } catch (e) {
        console.log(e);
      }
    },
    /*
    async getAccountById (id) {
      
      await API.graphql({
        query: getAccount,
        variables: { id: id },
      })
        .then((result) => {
          console.log(result);
          //this.form = result.data.getAccount;
          //return result.name, result.currency;
          return result.data.getAccount;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    */
    getAccountById: function (id) {
      for (const a in this.accounts) {
        //console.log(a, id);
        if (this.accounts[a].id == id) {
          return this.accounts[a];
        }
      }
    },
    async getAccount() {
      //console.log(this.accountId);
      //console.log(this.accounts);

      await API.graphql({
        query: getAccount,
        variables: { id: this.accountId },
      })
        .then((result) => {
          this.form = result.data.getAccount;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async getAllAccounts() {
      await API.graphql({
        query: listAccounts,
      })
        .then((result) => {
          //console.log(result);
          this.accounts = result.data.listAccounts.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async getTrans() {
      // trust name mapping (non-blocking)
      if (!this.trustMap || Object.keys(this.trustMap).length === 0) {
        this.buildTrustMap();
      }
      //get deposits-----
      // fetch all deposits with pagination
      var deposits = [];
      try {
        let nextToken = null;
        do {
          const res = await API.graphql({ query: listDeposits, variables: { limit: 100, nextToken } });
          const data = res?.data?.listDeposits;
          const items = data?.items || [];
          deposits.push(...items);
          nextToken = data?.nextToken || null;
        } while (nextToken);
      } catch (error) {
        console.log(error);
      }

      //console.log("-----1", this.accounts);
      //var accounts = this.accounts;

      // create dic----
      var dicAccountIdBalance = [];

      for (const a in this.accounts) {
        dicAccountIdBalance[this.accounts[a].id] = 0;
      }

      for (const kd in deposits) {
        //console.log(deposits[kd]);
        const d = deposits[kd];

        if (d.principalAccountId == this.form.id) {
          //console.log("-----11", d);
          d.principalAccountName = this.form.name + " " + this.form.currency;

          if (d.status == Enum.EnumDepositStatus.FINISHED.val) {
            //for display
            const tmpa = this.getAccountById(d.valueAccountId);
            //console.log(tmpa);
            d.valueAccountName = tmpa.name + " " + tmpa.currency;
          }

          this.deposits.push(d);
        } else if (d.valueAccountId == this.form.id) {
          //console.log("-----11", d);
          d.valueAccountName = this.form.name + " " + this.form.currency;

          //for display
          const tmpa = this.getAccountById(d.principalAccountId);
          d.principalAccountName = tmpa.name + " " + tmpa.currency;

          this.deposits.push(d);
        }

        //console.log("-------11", d.principal, d.value);
        //dicAccountIdBalance[d.principalAccountId] -= d.principal;

        /*
        if (d.status == Enum.EnumDepositStatus.FINISHED.val) {
          //console.log("-----3", d.status);
          dicAccountIdBalance[d.valueAccountId] += d.value;
        }
        */
      }

      //console.log("------12");
      //console.log(dicAccountIdBalance);

      //trust transaction----
      //TODO
      //kokokara: update schema for account

      // fetch all trust transactions with pagination
      var trusttransactions = [];
      try {
        let nextToken = null;
        do {
          const res = await API.graphql({ query: listTrustTransactions, variables: { limit: 100, nextToken } });
          const data = res?.data?.listTrustTransactions;
          const items = data?.items || [];
          trusttransactions.push(...items);
          nextToken = data?.nextToken || null;
        } while (nextToken);
      } catch (error) {
        console.log(error);
      }
      //console.log(trusttransactions);

      for (const ktt in trusttransactions) {
        const tt = trusttransactions[ktt];

        if (tt.accountId == this.form.id) {
          //  console.log(tt);
          this.trusttransactions.push(tt);
        }
        /*
        if (tt.tradeType == Enum.EnumTradeType.BUY.val) {
          dicAccountIdBalance[tt.accountId] -= tt.buy;
          console.log("------31", tt.buy);
        } else if (tt.tradeType == Enum.EnumTradeType.SELL.val) {
          dicAccountIdBalance[tt.accountId] += tt.sell;
          console.log("------32", tt.sell);
        } else if (tt.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
          dicAccountIdBalance[tt.accountId] += tt.dividend;
          console.log("------33", tt);
        }
        */
      }
    },
    setSort(k) {
      if (this.sortKey === k) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = k;
        this.sortAsc = k === 'date' ? false : true;
      }
      this.page = 1; // reset to first page on sort change
    },
    nextPage() {
      if (this.page < this.totalPages) this.page++;
    },
    prevPage() {
      if (this.page > 1) this.page--;
    },
  },
  computed: {
    sortedTrustTransactions() {
      const key = this.sortKey;
      const asc = this.sortAsc ? 1 : -1;
      const arr = (this.trusttransactions || []).slice();
      const getTrustName = (tt) => this.trustMap[tt.trustBalanceId] || '';
      arr.sort((a, b) => {
        let va, vb;
        if (key === 'date') {
          va = new Date(a.date).getTime() || 0;
          vb = new Date(b.date).getTime() || 0;
        } else if (key === 'tradeType') {
          va = String(a.tradeType || '');
          vb = String(b.tradeType || '');
        } else if (key === 'buy') {
          va = Number(a.buy || 0);
          vb = Number(b.buy || 0);
        } else if (key === 'sell') {
          va = Number(a.sell || 0);
          vb = Number(b.sell || 0);
        } else if (key === 'dividend') {
          va = Number(a.dividend || 0);
          vb = Number(b.dividend || 0);
        } else if (key === 'trust') {
          va = getTrustName(a);
          vb = getTrustName(b);
        } else {
          va = 0; vb = 0;
        }
        if (va < vb) return -1 * asc;
        if (va > vb) return 1 * asc;
        return 0;
      });
      return arr;
    },
    totalPages() {
      const n = this.sortedTrustTransactions.length;
      return n === 0 ? 1 : Math.ceil(n / this.perPage);
    },
    pagedTrustTransactions() {
      const start = (this.page - 1) * this.perPage;
      const end = start + this.perPage;
      return this.sortedTrustTransactions.slice(start, end);
    },
    pagedCount() {
      return this.pagedTrustTransactions.length;
    },
  },
};
</script>
