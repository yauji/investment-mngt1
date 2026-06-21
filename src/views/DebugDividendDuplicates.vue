<template>
  <div>
    <h1>Dividend Duplicate Check</h1>

    <p class="text-muted">
      同一Trust Balance・同一日付・同一配当金額のDIVIDENDを重複として表示します。各グループでは作成日時が最も古い1件を残します。
    </p>

    <div class="d-flex align-items-center mb-3" style="gap: 12px; flex-wrap: wrap;">
      <button class="btn btn-outline-primary" :disabled="loading || busy" @click="refresh">
        {{ loading ? 'Loading…' : 'Reload' }}
      </button>
      <button class="btn btn-danger" :disabled="loading || busy || !duplicateGroups.length" @click="removeDuplicates">
        {{ busy ? 'Deleting…' : `Remove duplicates (delete ${duplicateTransactionCount})` }}
      </button>
      <span v-if="!loading" class="text-muted">
        重複グループ: {{ duplicateGroups.length }} / 削除対象: {{ duplicateTransactionCount }}
      </span>
    </div>

    <div v-if="message" class="alert" :class="messageError ? 'alert-danger' : 'alert-info'" role="status">
      {{ message }}
    </div>

    <div v-if="loading" class="text-muted">Loading Trust Transactions…</div>
    <div v-else-if="!duplicateGroups.length" class="alert alert-success">
      DIVIDENDの重複はありません。
    </div>
    <div v-else class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Trust Balance</th>
            <th>date</th>
            <th class="text-end">dividend</th>
            <th class="text-end">records</th>
            <th>残す取引</th>
            <th>削除対象</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in duplicateGroups" :key="group.key">
            <td>
              <div>{{ group.trustBalanceName }}</div>
              <small class="text-muted">{{ group.trustBalanceId }}</small>
            </td>
            <td>{{ group.date }}</td>
            <td class="text-end">{{ formatAmount(group.amount) }}</td>
            <td class="text-end">{{ group.transactions.length }}</td>
            <td>
              <code>{{ group.transactions[0].id }}</code>
              <br />
              <small class="text-muted">created: {{ formatDateTime(group.transactions[0].createdAt) }}</small>
            </td>
            <td>
              <ul class="mb-0 ps-3">
                <li v-for="transaction in group.transactions.slice(1)" :key="transaction.id">
                  <code>{{ transaction.id }}</code>
                  <small class="text-muted"> (created: {{ formatDateTime(transaction.createdAt) }})</small>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { API } from 'aws-amplify';
import { listTrustBalances, listTrustTransactions } from '../graphql/queries';
import { deleteTrustTransaction } from '../graphql/mutations';

export default {
  name: 'DebugDividendDuplicates',
  data() {
    return {
      duplicateGroups: [],
      loading: false,
      busy: false,
      message: '',
      messageError: false,
    };
  },
  computed: {
    duplicateTransactionCount() {
      return this.duplicateGroups.reduce((count, group) => count + group.transactions.length - 1, 0);
    },
  },
  async created() {
    await this.refresh();
  },
  methods: {
    async fetchAll(query, resultKey) {
      const all = [];
      let nextToken = null;
      do {
        const res = await API.graphql({ query, variables: { limit: 100, nextToken } });
        const data = res?.data?.[resultKey];
        all.push(...(data?.items || []).filter(Boolean));
        nextToken = data?.nextToken || null;
      } while (nextToken);
      return all;
    },
    dateKey(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value || '').slice(0, 10);
      return date.toISOString().slice(0, 10);
    },
    amountKey(value) {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount.toFixed(2) : null;
    },
    formatAmount(value) {
      const amount = Number(value);
      return Number.isFinite(amount)
        ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '---';
    },
    formatDateTime(value) {
      if (!value) return '---';
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
    },
    buildDuplicateGroups(transactions, trustBalanceNames) {
      const groups = new Map();
      for (const transaction of transactions) {
        if (String(transaction.tradeType || '').toUpperCase() !== 'DIVIDEND') continue;
        if (!transaction.trustBalanceId) continue;
        const amount = this.amountKey(transaction.dividend);
        const date = this.dateKey(transaction.date);
        if (amount === null || !date) continue;
        const key = `${transaction.trustBalanceId}|${date}|${amount}`;
        if (!groups.has(key)) {
          groups.set(key, {
            key,
            trustBalanceId: transaction.trustBalanceId,
            trustBalanceName: trustBalanceNames[transaction.trustBalanceId] || transaction.trustBalanceId,
            date,
            amount: Number(transaction.dividend),
            transactions: [],
          });
        }
        groups.get(key).transactions.push(transaction);
      }

      return Array.from(groups.values())
        .filter((group) => group.transactions.length > 1)
        .map((group) => ({
          ...group,
          transactions: group.transactions.sort((a, b) => {
            const createdDiff = String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
            return createdDiff || String(a.id).localeCompare(String(b.id));
          }),
        }))
        .sort((a, b) => a.trustBalanceName.localeCompare(b.trustBalanceName)
          || a.date.localeCompare(b.date)
          || a.amount - b.amount);
    },
    async refresh() {
      this.loading = true;
      this.message = '';
      this.messageError = false;
      try {
        const [transactions, trustBalances] = await Promise.all([
          this.fetchAll(listTrustTransactions, 'listTrustTransactions'),
          this.fetchAll(listTrustBalances, 'listTrustBalances'),
        ]);
        const trustBalanceNames = Object.fromEntries(
          trustBalances.map((trustBalance) => [trustBalance.id, trustBalance.name]),
        );
        this.duplicateGroups = this.buildDuplicateGroups(transactions, trustBalanceNames);
        return true;
      } catch (error) {
        console.error(error);
        this.message = '重複データの取得に失敗しました。コンソールを確認してください。';
        this.messageError = true;
        return false;
      } finally {
        this.loading = false;
      }
    },
    async removeDuplicates() {
      const count = this.duplicateTransactionCount;
      if (!count) return;
      if (!confirm(`重複したDIVIDENDを${count}件削除します。各グループの最も古い1件は残します。続行しますか？`)) return;

      this.busy = true;
      this.message = '';
      this.messageError = false;
      let deleted = 0;
      let failed = 0;
      const targets = this.duplicateGroups.reduce(
        (all, group) => all.concat(group.transactions.slice(1)),
        [],
      );
      try {
        for (const transaction of targets) {
          try {
            await API.graphql({ query: deleteTrustTransaction, variables: { input: { id: transaction.id } } });
            deleted++;
          } catch (error) {
            console.error('Failed to delete duplicate transaction', transaction.id, error);
            failed++;
          }
        }
        const refreshed = await this.refresh();
        if (refreshed) {
          this.message = `重複排除を完了しました。削除: ${deleted}件、失敗: ${failed}件。`;
          this.messageError = failed > 0;
        }
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>
