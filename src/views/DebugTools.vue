<template>
  <div>
    <h1>Debug Tools</h1>
    <div class="mb-3">
      <button class="btn btn-danger" :disabled="busy" @click="deleteAllTrustTransactions">
        {{ busy ? 'Deleting…' : 'Delete ALL Trust Transactions' }}
      </button>
      <div class="mt-2 text-muted" v-if="log">{{ log }}</div>
    </div>
  </div>
</template>

<script>
import { API } from 'aws-amplify';
import { listTrustTransactions } from '../graphql/queries';
import { deleteTrustTransaction } from '../graphql/mutations';

export default {
  name: 'DebugTools',
  data() {
    return {
      busy: false,
      log: '',
    };
  },
  methods: {
    async fetchAllTrustTransactions() {
      const all = [];
      let nextToken = null;
      do {
        const res = await API.graphql({ query: listTrustTransactions, variables: { limit: 100, nextToken } });
        const data = res?.data?.listTrustTransactions;
        const items = data?.items || [];
        all.push(...items);
        nextToken = data?.nextToken || null;
      } while (nextToken);
      return all;
    },
    async deleteAllTrustTransactions() {
      if (!confirm('Delete ALL Trust Transactions? This cannot be undone.')) return;
      this.busy = true;
      this.log = 'Fetching transactions…';
      try {
        const items = await this.fetchAllTrustTransactions();
        let ok = 0, fail = 0;
        this.log = `Found ${items.length} transactions. Deleting…`;
        for (const t of items) {
          try {
            await API.graphql({ query: deleteTrustTransaction, variables: { input: { id: t.id } } });
            ok++;
            if (ok % 50 === 0) this.log = `Deleted ${ok}/${items.length}…`;
          } catch (e) {
            console.warn('delete failed', t.id, e);
            fail++;
          }
        }
        this.log = `Done. Deleted=${ok}, Failed=${fail}`;
        alert(this.log);
      } catch (e) {
        console.error(e);
        this.log = 'Failed. See console.';
        alert('Delete failed. See console.');
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>

<style scoped>
</style>

