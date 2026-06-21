<template>
  <div>
    <h1>Inputdata - CSV (Rakuten)</h1>
    <ul>
      <li>楽天証券のCSV（ヘッダー必須）を貼り付けてください。</li>
      <li>取引のマッピング: 買付/再投資/入庫 → BUY、解約 → SELL</li>
      <li>日付は 「約定日」→「受渡日」の順で使用。数量・単価・受渡金額(円)を保存します。</li>
      <li>口座種別は「口座」を参照（一般→特定として扱います）。</li>
    </ul>
    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">利用アカウント</label>
        <select class="form-select" v-model="form.accountId" required>
          <option v-for="a in accounts" :key="a.id" :value="a.id">
            {{ a.currency }} - {{ a.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">CSVテキスト</label>
        <textarea class="form-control" rows="10" v-model="form.text" />
      </div>
      <input type="submit" value="Import Rakuten CSV" />
    </form>

    <hr />

    <h2>楽天証券 分配金 CSV</h2>
    <ul>
      <li>「受取金額[円/現地通貨]」を配当金額として登録します。</li>
      <li>銘柄列で TrustBalance を特定し、取引種別は DIVIDEND 固定です。</li>
      <li>[マイメニュー]->[配当・分配金] ->期間すべてで検索 ->[CSVで保存]</li>
      <li>税引き後、受取金額を登録。そのため、楽天証券の画面上の値よりも小さくなる。</li>
    </ul>
    <form @submit.prevent="submitDividend">
      <div class="mb-3">
        <label class="form-label">利用アカウント</label>
        <select class="form-select" v-model="formDividend.accountId" required>
          <option v-for="a in accounts" :key="a.id" :value="a.id">
            {{ a.currency }} - {{ a.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">CSVテキスト</label>
        <textarea class="form-control" rows="8" v-model="formDividend.text" />
      </div>
      <input type="submit" value="Import Dividend CSV" />
    </form>

    <div v-if="skipped.length" class="mt-2">
      <div><b>スキップ:</b> {{ skipped.length }} 件</div>
      <ul>
        <li v-for="(s,i) in skipped" :key="i">
          <span class="text-muted">[{{ i+1 }}]</span>
          <span>{{ s.reason }}</span>
          <span> — {{ summarizeRow(s.row) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { API } from 'aws-amplify';
import { listAccounts, listTrustBalances, listTrustTransactions } from "../graphql/queries";
import { createTrustTransaction, createTrustBalance } from "../graphql/mutations";
import * as Enum from "@/Enum";

export default {
  name: 'InputdataCsvRakuten',
  async created() {
    await this.getAccounts();
    await this.getTrustBalancesAll();
  },
  data() {
    return {
      form: { text: '', accountId: '' },
      formDividend: { text: '', accountId: '' },
      accounts: [],
      trustbalances: [],
      tbIndexByName: new Map(),
      txDupIndexByTbAccount: new Map(),
      skipped: [],
    };
  },
  methods: {
    summarizeRow(row) {
      if (!row || typeof row !== 'object') return '';
      const d = row['約定日'] || row['受渡日'] || '';
      const t = row['取引'] || '';
      const name = row['ファンド名'] || row['銘柄'] || '';
      const amt = row['受渡金額/(ポイント利用)[円]'] || row['受取金額[円/現地通貨]'] || '';
      return `${d} ${t} ${name} ${amt}`.trim();
    },
    parseCsvWithHeader(text) {
      if (!text) return [];
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
      if (!lines.length) return [];
      const header = this.splitCsvLine(lines[0]).map(h => h.trim());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = this.splitCsvLine(lines[i]);
        const r = {};
        for (let j = 0; j < header.length; j++) r[header[j]] = cols[j] !== undefined ? cols[j] : '';
        rows.push(r);
      }
      return rows;
    },
    splitCsvLine(line) {
      const out = []; let cur = ''; let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i+1] === '"') { cur += '"'; i++; } else { inQ = !inQ; }
        } else if (ch === ',' && !inQ) {
          out.push(cur); cur = '';
        } else { cur += ch; }
      }
      out.push(cur);
      return out.map(s => s.replace(/^"(.*)"$/, '$1'));
    },
    toNumberOrNull(s) {
      if (s === undefined || s === null) return null;
      const t = String(s).trim();
      if (!t || t === '-' ) return null;
      const n = Number(t.replace(/,/g, ''));
      return Number.isNaN(n) ? null : n;
    },
    toSafeISO(s) {
      if (s === undefined || s === null) return null;
      const t = String(s).trim();
      if (!t || t === '0' || t.toLowerCase() === 'null' || t.toLowerCase() === 'undefined') return null;
      const d = new Date(t);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString();
    },
    pickDateISO(...cands) {
      for (const c of cands) {
        const iso = this.toSafeISO(c);
        if (iso) return iso;
      }
      return null;
    },
    mapTradeType(v) {
      const t = String(v || '').trim();
      if (t === '買付' || t === '再投資' || t === '入庫') return Enum.EnumTradeType.BUY.val;
      if (t === '解約') return Enum.EnumTradeType.SELL.val;
      return null;
    },
    mapAccountTypeJP(v) {
      const t = String(v || '').trim();
      if (t === 'NISA') return 'NISA';
      if (t === '特定' || t === '一般') return 'TOKUTEI';
      return null;
    },
    normalizeName(s) {
      return String(s || '').trim();
    },
    txDateKey(date) {
      if (!date) return '';
      try {
        const d = new Date(date);
        if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      } catch (_) { /* noop */ }
      const s = String(date || '').trim();
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      return s;
    },
    buildDupKey(tradeType, date, amount) {
      const type = String(tradeType || '').toUpperCase();
      if (!type) return null;
      const dKey = this.txDateKey(date);
      if (!dKey) return null;
      const amt = amount !== undefined && amount !== null ? Number(amount) : 0;
      if (!Number.isFinite(amt)) return null;
      return `${dKey}|${type}|${amt.toFixed(6)}`;
    },
    amountFromExistingTx(tx) {
      if (!tx) return null;
      const type = String(tx.tradeType || '').toUpperCase();
      const buy = this.toNumberOrNull(tx.buy);
      const sell = this.toNumberOrNull(tx.sell);
      const dividend = this.toNumberOrNull(tx.dividend);
      if (type === Enum.EnumTradeType.BUY.val) {
        if (buy !== null) return buy;
      }
      if (type === Enum.EnumTradeType.SELL.val) {
        if (sell !== null) return sell;
      }
      if (type === Enum.EnumTradeType.DIVIDEND.val) {
        if (dividend !== null) return dividend;
      }
      if (buy !== null) return buy;
      if (sell !== null) return sell;
      if (dividend !== null) return dividend;
      return 0;
    },
    async ensureTxDupIndex(trustBalanceId, accountId) {
      if (!trustBalanceId || !accountId) return new Set();
      const cacheKey = `${trustBalanceId}|${accountId}`;
      if (this.txDupIndexByTbAccount.has(cacheKey)) return this.txDupIndexByTbAccount.get(cacheKey);
      const set = new Set();
      let nextToken = null;
      do {
        const filter = { and: [{ trustBalanceId: { eq: trustBalanceId } }, { accountId: { eq: accountId } }] };
        const res = await API.graphql({
          query: listTrustTransactions,
          variables: { filter, limit: 100, nextToken },
        });
        const data = res?.data?.listTrustTransactions;
        const items = data?.items || [];
        for (const tx of items) {
          const amount = this.amountFromExistingTx(tx);
          const key = this.buildDupKey(tx.tradeType, tx.date, amount);
          if (key) set.add(key);
        }
        nextToken = data?.nextToken || null;
      } while (nextToken);
      this.txDupIndexByTbAccount.set(cacheKey, set);
      return set;
    },
    rebuildTbIndex() {
      const map = new Map();
      for (const tb of (this.trustbalances || [])) {
        const name = this.normalizeName(tb.name);
        if (!name) continue;
        const arr = map.get(name) || [];
        arr.push(tb);
        map.set(name, arr);
      }
      this.tbIndexByName = map;
    },
    async findTrustBalanceIdByName(nameRaw, accountTypeRaw) {
      const name = this.normalizeName(nameRaw);
      if (!name) return null;
      const type = this.mapAccountTypeJP(accountTypeRaw);
      // exact local
      const byName = (this.tbIndexByName.get(name) || []).slice();
      if (byName.length) {
        if (type) {
          // 優先: type一致。次点: type未設定のものを許容。
          const x = byName.find(tb => String(tb.type || '') === type) || byName.find(tb => !tb.type);
          if (x) return x.id;
          // type不一致の場合はAPI検索/作成へフォールバック（returnしない）
        } else {
          return byName[0].id;
        }
      }
      // API search eq → contains
      let found = null;
      try {
        let nextToken = null;
        do {
          const filter = type ? { and: [{ name: { eq: name } }, { type: { eq: type } }] } : { name: { eq: name } };
          const res = await API.graphql({ query: listTrustBalances, variables: { filter, limit: 100, nextToken } });
          const items = res?.data?.listTrustBalances?.items || [];
          nextToken = res?.data?.listTrustBalances?.nextToken || null;
          const arr = items.filter(i => this.normalizeName(i.name) === name && (!type || String(i.type || '') === type));
          if (arr.length) { found = arr; break; }
        } while (nextToken);
      } catch (e) {
        console.warn('[Rakuten] listTrustBalances eq search failed', e);
      }
      if (!found) {
        try {
          let next = null;
          do {
            const filter = type ? { and: [{ name: { contains: name } }, { type: { eq: type } }] } : { name: { contains: name } };
            const res = await API.graphql({ query: listTrustBalances, variables: { filter, limit: 100, nextToken: next } });
            const items = res?.data?.listTrustBalances?.items || [];
            next = res?.data?.listTrustBalances?.nextToken || null;
            const arr = items.filter(i => this.normalizeName(i.name) === name || (String(i.name || '').includes(name) && (!type || String(i.type || '') === type)));
            if (arr.length) { found = arr; break; }
          } while (next);
        } catch (e) {
          console.warn('[Rakuten] listTrustBalances contains search failed', e);
        }
      }
      if (found && found.length) {
        this.trustbalances.push(...found);
        this.rebuildTbIndex();
        return found[0].id;
      }
      // 未発見: TrustBalance を新規作成（currency: JPY, type: TOKUTEI 既定）
      try {
        const input = {
          currency: Enum.EnumCurrency.JPY.val,
          name,
          code: '',
          type: type || 'TOKUTEI',
          balance: 0,
          noItem: 0,
          basicPrice: 0,
          averagePurchasePrice: 0,
        };
        const res = await API.graphql({ query: createTrustBalance, variables: { input } });
        const tb = res?.data?.createTrustBalance;
        if (tb && tb.id) {
          this.trustbalances.push(tb);
          this.rebuildTbIndex();
          return tb.id;
        }
      } catch (e) {
        console.warn('[Rakuten] createTrustBalance failed', e);
      }
      return null;
    },
    async submit() {
      this.skipped = [];
      const text = this.form.text;
      if (!text) { alert('テキストを入力してください'); return; }
      if (!this.form.accountId) { alert('アカウントを選択してください'); return; }
      if (!this.trustbalances || this.trustbalances.length === 0) await this.getTrustBalancesAll();
      this.rebuildTbIndex();
      const rows = this.parseCsvWithHeader(text);
      if (!rows.length) { alert('有効な行がありません'); return; }

      let ok = 0, skip = 0;
      for (const r of rows) {
        try {
          const name = String(r['ファンド名'] || '').trim();
          const rawType = String(r['取引'] || '').trim();
          // 一部行（明細集計など）はスキップ: ファンド名・取引が両方空 or 受渡金額が空
          const amount = this.toNumberOrNull(r['受渡金額/(ポイント利用)[円]']);
          if (!name || !rawType) { this.skipped.push({ reason: '銘柄名/取引が不足', row: r }); skip++; continue; }

          const tradeType = this.mapTradeType(rawType);
          if (!tradeType) { this.skipped.push({ reason: '未対応の取引種別', row: r }); skip++; continue; }
          const trustBalanceId = await this.findTrustBalanceIdByName(name, r['口座']);
          if (!trustBalanceId) { this.skipped.push({ reason: '該当するTrustBalanceが見つからない', row: r }); skip++; continue; }
          const date = this.pickDateISO(r['約定日'], r['受渡日']);
          if (!date) { this.skipped.push({ reason: '日付が不正または欠損', row: r }); skip++; continue; }
          const dupIndex = await this.ensureTxDupIndex(trustBalanceId, this.form.accountId);
          const amountForDup = amount !== null ? amount : 0;
          const dupKey = this.buildDupKey(tradeType, date, amountForDup);
          if (dupKey && dupIndex.has(dupKey)) {
            this.skipped.push({ reason: '重複エントリ', row: r });
            skip++;
            continue;
          }

          // 口数は 1/10000 にスケール
          const qtyRaw = this.toNumberOrNull(r['数量［口］']);
          const qty = qtyRaw !== null ? (qtyRaw / 10000) : null;
          const price = this.toNumberOrNull(r['単価']);

          const input = {
            accountId: this.form.accountId,
            trustBalanceId,
            date,
            tradeType,
          };
          if (price !== null) input.basicPrice = price;
          if (qty !== null) input.noItem = qty;
          if (tradeType === Enum.EnumTradeType.BUY.val && amount !== null) input.buy = amount;
          if (tradeType === Enum.EnumTradeType.SELL.val && amount !== null) input.sell = amount;

          await API.graphql({ query: createTrustTransaction, variables: { input } });
          if (dupKey) dupIndex.add(dupKey);
          ok++;
        } catch (e) {
          console.error('[Rakuten] createTrustTransaction failed', e, r);
          this.skipped.push({ reason: '登録時エラー', row: r });
          skip++;
        }
      }
      alert(`Rakuten import finished. success=${ok}, skipped=${skip}`);
    },
    async submitDividend() {
      this.skipped = [];
      const text = this.formDividend.text;
      if (!text) { alert('テキストを入力してください'); return; }
      if (!this.formDividend.accountId) { alert('アカウントを選択してください'); return; }
      if (!this.trustbalances || this.trustbalances.length === 0) await this.getTrustBalancesAll();
      this.rebuildTbIndex();
      const rows = this.parseCsvWithHeader(text);
      if (!rows.length) { alert('有効な行がありません'); return; }

      let ok = 0, skip = 0;
      for (const r of rows) {
        try {
          const name = String(r['銘柄'] || r['ファンド名'] || '').trim();
          if (!name) { this.skipped.push({ reason: '銘柄名が不明', row: r }); skip++; continue; }
          const trustBalanceId = await this.findTrustBalanceIdByName(name, r['口座']);
          if (!trustBalanceId) { this.skipped.push({ reason: '該当するTrustBalanceが見つからない', row: r }); skip++; continue; }
          const date = this.toSafeISO(r['入金日']);
          if (!date) { this.skipped.push({ reason: '日付が不正または欠損', row: r }); skip++; continue; }
          const amount = this.toNumberOrNull(r['受取金額[円/現地通貨]']);
          if (amount === null) { this.skipped.push({ reason: '受取金額が不明', row: r }); skip++; continue; }

          const dupIndex = await this.ensureTxDupIndex(trustBalanceId, this.formDividend.accountId);
          const dupKey = this.buildDupKey(Enum.EnumTradeType.DIVIDEND.val, date, amount);
          if (dupKey && dupIndex.has(dupKey)) {
            this.skipped.push({ reason: '重複エントリ(DIVIDEND)', row: r });
            skip++;
            continue;
          }

          const input = {
            accountId: this.formDividend.accountId,
            trustBalanceId,
            date,
            tradeType: Enum.EnumTradeType.DIVIDEND.val,
            dividend: amount,
          };

          await API.graphql({ query: createTrustTransaction, variables: { input } });
          if (dupKey) dupIndex.add(dupKey);
          ok++;
        } catch (e) {
          console.error('[RakutenDividend] createTrustTransaction failed', e, r);
          this.skipped.push({ reason: '登録時エラー', row: r });
          skip++;
        }
      }
      alert(`Rakuten dividend import finished. success=${ok}, skipped=${skip}`);
    },
    async getAccounts() {
      try {
        const res = await API.graphql({ query: listAccounts });
        this.accounts = res?.data?.listAccounts?.items || [];
      } catch (e) { console.warn(e); }
    },
    async getTrustBalancesAll() {
      const all = [];
      let nextToken = null;
      do {
        const res = await API.graphql({ query: listTrustBalances, variables: { limit: 100, nextToken } });
        const items = res?.data?.listTrustBalances?.items || [];
        nextToken = res?.data?.listTrustBalances?.nextToken || null;
        all.push(...items);
      } while (nextToken);
      this.trustbalances = all;
      this.rebuildTbIndex();
      return all;
    },
  }
}
</script>

<style scoped>
</style>
