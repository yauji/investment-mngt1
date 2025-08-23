<template>
  <div>
    <h1>Trust Transactions</h1>

    <table class="table table-striped">
      <thead>
        <tr>
          <th @click="sortBy('date')">date</th>
          <th>trade Type</th>
          <th @click="sortBy('trustBalanceId')">trust</th>
          <th>account</th>
          <th>basic Price</th>
          <th>no Item</th>
          <th>buy</th>
          <th>sell</th>
          <th>dividend</th>

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
          <td>{{ moment(trusttransaction.date) }}</td>
          <td>{{ trusttransaction.tradeType }}</td>
          <td>{{ trustMap[trusttransaction.trustBalanceId] || '-' }}</td>
          <td>{{ accountMap[trusttransaction.accountId] || '-' }}</td>
          <td>{{ numberFormat(trusttransaction.basicPrice) }}</td>
          <td>{{ trusttransaction.noItem }}</td>

          <td>{{ numberFormat(trusttransaction.buy) }}</td>
          <td>{{ numberFormat(trusttransaction.sell) }}</td>
          <td>{{ numberFormat(trusttransaction.dividend) }}</td>
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
  query ListTrustTransactions {
    listTrustTransactions {
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
      sort_key: "date",
      sort_asc: true,
    };
  },
  methods: {
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
    async getTrustTransactions() {
      try {
        const [txRes, tbRes, accRes] = await Promise.all([
          API.graphql({ query: LIST_TRUST_TX }),
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

        // Transactions; filter out any null slots that may appear when GraphQL null-bubbles in a list
        const items = (txRes?.data?.listTrustTransactions?.items || []).filter(Boolean);
        this.trusttransactions = items;

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