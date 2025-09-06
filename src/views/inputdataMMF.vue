<template>
  <div>
    <h1>Inputdata - MMF CSV</h1>

    <ul>
      <li>以下のヘッダーを含むCSVテキストを貼り付けてください。</li>
      <li>取引のマッピング: 再投資/自動買付 → BUY、売却 → SELL</li>
      <li>口座種別は「預り区分」（NISA/特定）を参照します。</li>
      <li>日付は 「約定日」→「国内受渡日」の順で使用（2025年08月28日、25/08/29 形式も可）。</li>
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
        <textarea class="form-control" rows="8" v-model="form.text" />
      </div>
      <input type="submit" value="Import Monex Alt CSV" />
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
import { listAccounts, listTrustBalances } from "../graphql/queries";
import { createTrustTransaction } from "../graphql/mutations";
import * as Enum from "@/Enum";

export default {
  name: 'InputdataMMF',
  async created() {
    await this.getAccounts();
    await this.getTrustBalancesAll();
  },
  data() {
    return {
      form: { text: '', accountId: '' },
      accounts: [],
      trustbalances: [],
      tbIndexByCode: new Map(),
      skipped: [],
    };
  },
  methods: {
    summarizeRow(row) {
      if (!row || typeof row !== 'object') return '';
      const d = row['約定日'] || row['国内受渡日'] || '';
      const t = row['取引'] || '';
      const name = row['銘柄名'] || '';
      const code = row['銘柄コード'] || '';
      const amt = row['受渡金額(円)'] || '';
      return `${d} ${t} ${name} ${code} ${amt}`.trim();
    },
    // ヘッダー前提のシンプルCSVパース（クォート対応）
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
      if (!t) return null;
      const n = Number(t.replace(/,/g, ''));
      return Number.isNaN(n) ? null : n;
    },
    toSafeISO(s) {
      if (s === undefined || s === null) return null;
      const t = String(s).trim();
      if (!t || t === '0' || t.toLowerCase() === 'null' || t.toLowerCase() === 'undefined') return null;
      const mJP = t.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
      if (mJP) {
        const yyyy = Number(mJP[1]);
        const mm = String(mJP[2]).padStart(2, '0');
        const dd = String(mJP[3]).padStart(2, '0');
        const d1 = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
        if (!Number.isNaN(d1.getTime())) return d1.toISOString();
      }
      const mShort = t.match(/^(\d{2})\/(\d{1,2})\/(\d{1,2})$/);
      if (mShort) {
        const yy = Number(mShort[1]);
        const yyyy = 2000 + yy;
        const mm = String(mShort[2]).padStart(2, '0');
        const dd = String(mShort[3]).padStart(2, '0');
        const d2 = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
        if (!Number.isNaN(d2.getTime())) return d2.toISOString();
      }
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
      if (t === '再投資' || t === '自動買付') return Enum.EnumTradeType.BUY.val;
      if (t === '売却') return Enum.EnumTradeType.SELL.val;
      return null;
    },
    mapAccountTypeJP(v) {
      const t = String(v || '').trim();
      if (t === 'NISA') return 'NISA';
      if (t === '特定') return 'TOKUTEI';
      return null;
    },
    normalizeCode(s) {
      return String(s || '').replace(/\s+/g, '').replace(/[^0-9A-Za-z]/g, '');
    },
    rebuildTbIndex() {
      const map = new Map();
      for (const tb of (this.trustbalances || [])) {
        const codeN = this.normalizeCode(tb.code);
        if (!codeN) continue;
        const arr = map.get(codeN) || [];
        arr.push(tb);
        map.set(codeN, arr);
      }
      this.tbIndexByCode = map;
    },
    async findTrustBalanceIdByCode(codeRaw, accountTypeRaw) {
      const code = this.normalizeCode(codeRaw);
      if (!code) return null;
      const type = this.mapAccountTypeJP(accountTypeRaw);
      const byCode = (this.tbIndexByCode.get(code) || []).slice();
      if (byCode.length) {
        if (type) {
          const x = byCode.find(tb => String(tb.type || '') === type);
          if (x) return x.id;
          return null;
        }
        return byCode[0].id;
      }
      // fallback API search eq → contains
      let found = null;
      try {
        let nextToken = null;
        do {
          const filter = type ? { and: [{ code: { eq: code } }, { type: { eq: type } }] } : { code: { eq: code } };
          const res = await API.graphql({ query: listTrustBalances, variables: { filter, limit: 100, nextToken } });
          const items = res?.data?.listTrustBalances?.items || [];
          nextToken = res?.data?.listTrustBalances?.nextToken || null;
          const arr = items.filter(i => this.normalizeCode(i.code) === code && (!type || String(i.type || '') === type));
          if (arr.length) { found = arr; break; }
        } while (nextToken);
      } catch (e) {
        console.warn('[InputdataMMF] listTrustBalances eq search failed', e);
      }
      if (!found) {
        try {
          let next = null;
          do {
            const filter = type ? { and: [{ code: { contains: code } }, { type: { eq: type } }] } : { code: { contains: code } };
            const res = await API.graphql({ query: listTrustBalances, variables: { filter, limit: 100, nextToken: next } });
            const items = res?.data?.listTrustBalances?.items || [];
            next = res?.data?.listTrustBalances?.nextToken || null;
            const arr = items.filter(i => this.normalizeCode(i.code) === code && (!type || String(i.type || '') === type));
            if (arr.length) { found = arr; break; }
          } while (next);
        } catch (e) {
          console.warn('[InputdataMMF] listTrustBalances contains search failed', e);
        }
      }
      if (found && found.length) {
        this.trustbalances.push(...found);
        this.rebuildTbIndex();
        return found[0].id;
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
          const tradeType = this.mapTradeType(r['取引']);
          if (!tradeType) { this.skipped.push({ reason: '未対応の取引種別', row: r }); skip++; continue; }
          const trustBalanceId = await this.findTrustBalanceIdByCode(r['銘柄コード'], r['預り区分']);
          if (!trustBalanceId) { this.skipped.push({ reason: '該当するTrustBalanceが見つからない', row: r }); skip++; continue; }
          const date = this.pickDateISO(r['約定日'], r['国内受渡日']);
          if (!date) { this.skipped.push({ reason: '日付が不正または欠損', row: r }); skip++; continue; }
          let basicPrice = this.toNumberOrNull(r['単価/返済約定単価']);
          let noItem = this.toNumberOrNull(r['数量（株/口）/返済数量']);
          const amount = this.toNumberOrNull(r['受渡金額(円)']);
          const input = {
            accountId: this.form.accountId,
            trustBalanceId,
            date,
            tradeType,
          };
          if (basicPrice !== null) input.basicPrice = basicPrice;
          if (noItem !== null) input.noItem = noItem;
          if (tradeType === Enum.EnumTradeType.BUY.val && amount !== null) input.buy = amount;
          if (tradeType === Enum.EnumTradeType.SELL.val && amount !== null) input.sell = amount;
          await API.graphql({ query: createTrustTransaction, variables: { input } });
          ok++;
        } catch (e) {
          console.error('[MonexAlt] createTrustTransaction failed', e, r);
          this.skipped.push({ reason: '登録時エラー', row: r });
          skip++;
        }
      }
      alert(`Monex Alt import finished. success=${ok}, skipped=${skip}`);
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
