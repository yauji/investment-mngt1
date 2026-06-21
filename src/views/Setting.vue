<template>
  <div>
    <h1>Settings</h1>

    <section class="mb-4">
      <h2>為替レート</h2>
      <p class="text-muted">1通貨あたりの円レートです。保存すると共通レートと同じ通貨を持つ全Accountのレートを更新します。</p>

      <table class="table table-bordered" style="max-width: 520px;">
        <thead>
          <tr>
            <th>通貨</th>
            <th>レート（1通貨あたりの円）</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="currency in currencies" :key="currency">
            <td>{{ currency }}</td>
            <td>
              <input
                v-model.number="editRates[currency]"
                type="number"
                min="0"
                step="0.0001"
                class="form-control"
                :disabled="currency === 'JPY' || busy"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="d-flex" style="gap: 8px;">
        <button class="btn btn-primary" :disabled="busy" @click="saveExchangeRates">
          {{ busy ? 'Saving…' : '為替レートを保存' }}
        </button>
        <button class="btn btn-outline-secondary" :disabled="busy" @click="resetEditRates">元に戻す</button>
      </div>
      <div v-if="status" class="mt-2" :class="statusError ? 'text-danger' : 'text-success'">{{ status }}</div>
    </section>

    <amplify-sign-out button-text="Sign out"></amplify-sign-out>
  </div>
</template>

<script>
import { API } from 'aws-amplify';
import { listAccounts } from '../graphql/queries';
import { updateAccount } from '../graphql/mutations';
import { mapState } from 'vuex';

export default {
  name: "Setting",

  async created() {
    const loaded = await this.loadAccounts();
    this.resetEditRates();
    if (!loaded) {
      this.status = 'Accountの取得に失敗しました。共通レートのみ保存できます。';
      this.statusError = true;
    }
  },
  data() {
    return {
      accounts: [],
      editRates: {},
      busy: false,
      status: '',
      statusError: false,
    };
  },
  computed: {
    ...mapState(['exchangeRates']),
    currencies() {
      const values = new Set(['JPY', ...Object.keys(this.exchangeRates || {})]);
      for (const account of this.accounts) {
        const currency = String(account?.currency || '').toUpperCase();
        if (currency) values.add(currency);
      }
      return Array.from(values).sort((a, b) => {
        if (a === 'JPY') return -1;
        if (b === 'JPY') return 1;
        return a.localeCompare(b);
      });
    },
  },
  methods: {
    async loadAccounts() {
      const all = [];
      let nextToken = null;
      try {
        do {
          const res = await API.graphql({ query: listAccounts, variables: { limit: 100, nextToken } });
          const data = res?.data?.listAccounts;
          all.push(...(data?.items || []).filter(Boolean));
          nextToken = data?.nextToken || null;
        } while (nextToken);
        this.accounts = all;
        return true;
      } catch (error) {
        console.error('Failed to load accounts for exchange-rate settings', error);
        return false;
      }
    },
    resetEditRates() {
      const rates = {};
      for (const currency of this.currencies) {
        rates[currency] = currency === 'JPY' ? 1 : (Number(this.exchangeRates[currency]) || 0);
      }
      this.editRates = rates;
      this.status = '';
      this.statusError = false;
    },
    async saveExchangeRates() {
      const rates = { JPY: 1 };
      for (const currency of this.currencies) {
        if (currency === 'JPY') continue;
        const rate = Number(this.editRates[currency]);
        if (!Number.isFinite(rate) || rate <= 0) {
          this.status = `${currency}のレートには0より大きい数値を入力してください。`;
          this.statusError = true;
          return;
        }
        rates[currency] = rate;
      }

      this.busy = true;
      this.status = '';
      this.statusError = false;
      let updated = 0;
      let failed = 0;
      try {
        for (const account of this.accounts) {
          const currency = String(account.currency || '').toUpperCase();
          const exchangeRate = rates[currency];
          if (!Number.isFinite(exchangeRate)) continue;
          try {
            await API.graphql({ query: updateAccount, variables: { input: { id: account.id, exchangeRate } } });
            updated++;
          } catch (error) {
            console.error('Failed to update account exchange rate', account.id, error);
            failed++;
          }
        }
        this.$store.commit('setExchangeRates', rates);
        this.status = `為替レートを保存しました。Account更新: ${updated}件、失敗: ${failed}件。`;
        this.statusError = failed > 0;
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>
