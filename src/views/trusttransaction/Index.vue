<template>
  <div>
    <h1>Trust Transactions</h1>

    <div class="d-flex align-items-center mb-2" style="gap: 12px; flex-wrap: wrap;">
      <div>
        <label>Rows:</label>
        <select class="form-select d-inline-block" style="width: auto;" v-model.number="pageSize" @change="changePageSize">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <div>
        <label class="me-1">Date From:</label>
        <input type="date" class="form-control d-inline-block" style="width:auto;" v-model="filterDateFrom" @change="applyFilters" />
      </div>
      <div>
        <label class="me-1">Date To:</label>
        <input type="date" class="form-control d-inline-block" style="width:auto;" v-model="filterDateTo" @change="applyFilters" />
      </div>
      <div>
        <label class="me-1">Type:</label>
        <select class="form-select d-inline-block" style="width:auto;" v-model="filterType" @change="applyFilters">
          <option value="">All</option>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
          <option value="DIVIDEND">DIVIDEND</option>
        </select>
      </div>
      <div>
        <label class="me-1">Account:</label>
        <select class="form-select d-inline-block" style="width:auto;" v-model="filterAccountId" @change="applyFilters">
          <option value="">All</option>
          <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </div>
      <div class="btn-group" role="group">
        <button class="btn btn-outline-primary" @click="prevPage" :disabled="prevTokens.length === 0">Prev</button>
        <button class="btn btn-outline-primary" @click="nextPage" :disabled="!nextToken">Next</button>
      </div>
    </div>

    <table class="table table-striped">
      <thead>
        <tr>
          <th class="th-small" @click="sortBy('date')">date</th>
          <th class="th-small">trade Type</th>
          <th class="th-small" @click="sortBy('trustBalanceId')">trust</th>
          <th class="th-small">account</th>
          <th class="th-small th-num">basic Price</th>
          <th class="th-small th-num">no Item</th>
          <th class="th-small th-num">buy</th>
          <th class="th-small th-num">sell</th>
          <th class="th-small th-num">dividend</th>

          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(trusttransaction, index) in trusttransactions"
          :key="trusttransaction.id"
        >
          <td class="td-small">{{ moment(trusttransaction.date) }}</td>
          <td class="td-small">{{ trusttransaction.tradeType }}</td>
          <td class="td-small">{{ trustMap[trusttransaction.trustBalanceId] || '-' }}</td>
          <td class="td-small">{{ accountMap[trusttransaction.accountId] || '-' }}</td>
          <td class="td-small td-num">
            <span class="num-int">{{ formatParts(trusttransaction.basicPrice, 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(trusttransaction.basicPrice, 2).frac }}</span>
          </td>
          <td class="td-small td-num">
            <span class="num-int">{{ formatParts(trusttransaction.noItem, 4).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(trusttransaction.noItem, 4).frac }}</span>
          </td>

          <td class="td-small td-num">
            <span class="num-int">{{ formatParts(trusttransaction.buy, 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(trusttransaction.buy, 2).frac }}</span>
          </td>
          <td class="td-small td-num">
            <span class="num-int">{{ formatParts(trusttransaction.sell, 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(trusttransaction.sell, 2).frac }}</span>
          </td>
          <td class="td-small td-num">
            <span class="num-int">{{ formatParts(trusttransaction.dividend, 2).int }}</span><span class="num-dot">.</span><span class="num-frac">{{ formatParts(trusttransaction.dividend, 2).frac }}</span>
          </td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{
                name: 'TrustTransactionShow',
                params: { trustTransactionId: trusttransaction.id },
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
                name: 'TrustTransactionEdit',
                params: { trustTransactionId: trusttransaction.id },
              }"
            >
              <button class="btn btn-primary" @click="navigate">Edit</button>
            </router-link>
          </td>
          <td>
            <button
              class="btn btn-primary"
              @click="deleteTrustTransaction(index, trusttransaction.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <router-link
      custom
      v-slot="{ navigate }"
      :to="{ name: 'TrustTransactionCreate' }"
    >
      <button class="btn btn-primary" @click="navigate">
        Add TrustTransaction
      </button>
    </router-link>
  </div>
</template>

<script>
import { API } from "aws-amplify";
// import { listTrustTransactions } from "../../graphql/queries";
import { deleteTrustTransaction } from "../../graphql/mutations";

import moment from "moment";

// NOTE: Fetch transactions (without nested trustBalance to avoid non-null errors)
const LIST_TRUST_TX = /* GraphQL */ `
  query ListTrustTransactions($limit: Int, $nextToken: String, $filter: ModelTrustTransactionFilterInput) {
    listTrustTransactions(limit: $limit, nextToken: $nextToken, filter: $filter) {
      items {
        id
        date
        tradeType
        basicPrice
        noItem
        buy
        sell
        dividend
        trustBalanceId
        accountId
      }
      nextToken
    }
  }
`;

// Fetch all trust balances for id->name mapping
const LIST_TRUST_BALANCES = /* GraphQL */ `
  query ListTrustBalancesForMapping {
    listTrustBalances {
      items {
        id
        name
      }
    }
  }
`;

// Fetch all accounts for id->name mapping
const LIST_ACCOUNTS = /* GraphQL */ `
  query ListAccountsForMapping {
    listAccounts {
      items {
        id
        name
      }
    }
  }
`;

export default {
  name: "TrustTransactionIndex",
  async created() {
    //this.getTrustTransactions();
    this.getTrustTransactions();
  },
  data() {
    return {
      trusttransactions: [],
      trustMap: {},
      accountMap: {},
      accounts: [],
      sort_key: "date",
      sort_asc: true,
      pageSize: 25,
      nextToken: null,     // token for next page
      currentToken: null,  // token used to fetch current page (null for first page)
      prevTokens: [],      // stack of tokens for previous pages (sequence of currentToken values)
      // Filters
      filterDateFrom: "",
      filterDateTo: "",
      filterType: "",
      filterAccountId: "",
    };
  },
  methods: {
    formatParts(value, decimals = 2) {
      const n = Number(value);
      if (!Number.isFinite(n)) return { int: '---', frac: ''.padEnd(decimals, '0') };
      const fixed = n.toFixed(decimals);
      const [i, f = ''] = fixed.split('.');
      const intNum = Number(i);
      const intStr = Number.isFinite(intNum) ? intNum.toLocaleString() : i;
      return { int: intStr, frac: f };
    },
    buildFilter() {
      const and = [];
      if (this.filterType) {
        and.push({ tradeType: { eq: this.filterType } });
      }
      if (this.filterAccountId) {
        and.push({ accountId: { eq: this.filterAccountId } });
      }
      // Date is stored as ISO string; Amplify supports ge/le on strings
      if (this.filterDateFrom) {
        // convert to ISO start of day
        const fromISO = new Date(this.filterDateFrom + 'T00:00:00').toISOString();
        and.push({ date: { ge: fromISO } });
      }
      if (this.filterDateTo) {
        const toISO = new Date(this.filterDateTo + 'T23:59:59').toISOString();
        and.push({ date: { le: toISO } });
      }
      if (!and.length) return null;
      return { and };
    },
    async applyFilters() {
      // reset to first page when filters change
      this.prevTokens = [];
      this.currentToken = null;
      this.nextToken = null;
      await this.getTrustTransactions(null);
    },
    async changePageSize() {
      // reset pagination to first page
      this.prevTokens = [];
      this.currentToken = null;
      this.nextToken = null;
      await this.getTrustTransactions(null);
    },
    async nextPage() {
      if (!this.nextToken) return;
      // push current start token to history and advance
      this.prevTokens.push(this.currentToken);
      await this.getTrustTransactions(this.nextToken);
    },
    async prevPage() {
      if (this.prevTokens.length === 0) return;
      const prevStart = this.prevTokens.pop();
      await this.getTrustTransactions(prevStart || null);
    },
    sortBy(key) {
      this.sort_key === key
        ? (this.sort_asc = !this.sort_asc)
        : (this.sort_asc = true);
      this.sort_key = key;

      let set = 1;
      this.sort_asc ? (set = 1) : (set = -1);

      this.trusttransactions.sort((a, b) => {
        const av = a[this.sort_key];
        const bv = b[this.sort_key];
        if (av == null && bv == null) return 0;
        if (av == null) return 1 * set;
        if (bv == null) return -1 * set;
        if (av < bv) return -1 * set;
        if (av > bv) return 1 * set;
        return 0;
      });
    },
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    numberFormat: function (value) {
      if (value == null) {
        return "---";
      } else {
        return value.toLocaleString();
      }
    },
    async getTrustTransactions(token = null) {
      try {
        const [txRes, tbRes, accRes] = await Promise.all([
          API.graphql({ query: LIST_TRUST_TX, variables: { limit: this.pageSize, nextToken: token, filter: this.buildFilter() } }),
          API.graphql({ query: LIST_TRUST_BALANCES }),
          API.graphql({ query: LIST_ACCOUNTS }),
        ]);

        console.log(txRes);
        console.log(tbRes);

        // Build id -> name map for trust balances
        const balances = (tbRes?.data?.listTrustBalances?.items || []).filter(Boolean);
        const map = {};
        for (const b of balances) {
          map[b.id] = b.name;
        }
        this.trustMap = map;

        // Build id -> name map for accounts
        const accounts = (accRes?.data?.listAccounts?.items || []).filter(Boolean);
        const amap = {};
        for (const a of accounts) {
          amap[a.id] = a.name;
        }
        this.accountMap = amap;
        this.accounts = accounts;

        // Transactions; filter out any null slots that may appear when GraphQL null-bubbles in a list
        this.currentToken = token || null;
        const list = txRes?.data?.listTrustTransactions;
        const items = (list?.items || []).filter(Boolean);
        this.trusttransactions = items;
        this.nextToken = list?.nextToken || null;

        this.sortBy("date");
      } catch (error) {
        console.log(error);
      }
    },
    async deleteTrustTransaction(index, trusttransactionId) {
      if (!confirm("Delete TrustTransaction?")) return;

      await API.graphql({
        //query: deleteTrustTransaction,
        query: deleteTrustTransaction,
        variables: { input: { id: trusttransactionId } },
      })
        .then((result) => {
          console.log(result);
          this.trusttransactions.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
<style scoped>
.th-small { font-size: 0.85rem; color: #666; font-weight: 500; }
.td-small { font-size: 0.9rem; color: #555; }
.th-num { text-align: right; }
.td-num { text-align: right; font-variant-numeric: tabular-nums; }
.num-int { font-variant-numeric: tabular-nums; }
.num-frac { font-size: 0.8em; font-variant-numeric: tabular-nums; }
.num-dot { padding: 0 0.05em; opacity: 0.7; }
</style>
