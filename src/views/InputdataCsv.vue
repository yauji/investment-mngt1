<template>
  <div>
    <h1>Inputdata - CSV</h1>


   


    <hr />
    <h3>trust transactions (日本語CSVテキスト) - monex</h3>
    <ul>
      <li>下の形式（見出しを含む）のテキストを貼り付けてください。</li>
      <li>取引は E列「取引」から BUY/SELL/DIVIDEND にマッピング（分配金→DIVIDEND、再投資買付/お買付/かんたん積立→BUY、解約→SELL）。</li>
      <li>trustBalance は F列「銘柄コード」と一致するものを検索（可能なら C列「口座」の種別 NISA/特定 も考慮）。</li>
      <li>account は下記プルダウンで選択した共通アカウントを使用します。</li>
      <li>口数は、正しく1/10000するように。</li>
      <li>DLしたそのままではなく、NumberからエクスポートしたCSVを利用。クオートなし。</li>
      <li>header行も必要</li>
    </ul>
    <form @submit.prevent="submitCreateTrustTransactionsFromJPText">
      <div class="mb-3">
        <label class="form-label">利用アカウント</label>
        <select class="form-select" v-model="form.commonAccountId" required>
          <option v-for="a in accounts" :key="a.id" :value="a.id">
            {{ a.currency }} - {{ a.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">日本語CSVテキスト</label>
        <textarea
          class="form-control"
          rows="8"
          v-model="form.dataTrustTransactionsJP"

        />
      </div>
      <input type="submit" value="Import JP TrustTransactions" />
    </form>
    <div v-if="jpSkipped.length" class="mt-2">
      <div><b>スキップされたエントリ:</b> {{ jpSkipped.length }} 件</div>
      <ul>
        <li v-for="(s, i) in jpSkipped" :key="i">
          <span class="text-muted">[{{ i + 1 }}]</span>
          <span>{{ s.reason }}</span>
          <span> — {{ summarizeRow(s.row) }}</span>
        </li>
      </ul>
    </div>




    <hr />
    <h3>trust transactions (日本語テキスト) - 利金/分配金 簡易</h3>
    <ul>
      <li>下の形式（見出しを含む）のテキストを貼り付けてください。</li>
      <li>すべて DIVIDEND として登録し、基準価格・口数は登録しません。</li>
      <li>trustBalance は F列「銘柄コード」と一致するものを検索（exact一致→API exact→フォールバック検索）。</li>
      <li>account は下記プルダウンで選択したアカウントを使用します。</li>
    </ul>
    <form @submit.prevent="submitCreateTrustTransactionsSimple">
      <div class="mb-3">
        <label class="form-label">利用アカウント（簡易）</label>
        <select class="form-select" v-model="form.simpleAccountId" required>
          <option v-for="a in accounts" :key="a.id" :value="a.id">
            {{ a.currency }} - {{ a.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">日本語テキスト（列: 日付,種別,決済・受取,銘柄名,通貨,銘柄コード,受渡金額,為替レート(円)）</label>
        <textarea
          class="form-control"
          rows="6"
          v-model="form.simpleDataDividendsJP"
          placeholder="日付,種別,決済・受取,銘柄名,通貨,銘柄コード,受渡金額,為替レート(円)\n2025/08/22,利金,外貨建MMF,アップル 2060/8/20満期 米ドル建債券,USD,MG919A001,508.69,"
        />
      </div>
      <input type="submit" value="Import Simple DIVIDEND" />
    </form>

  </div>
</template>

<script>
import { API } from "aws-amplify";
//import { listAccounts } from "../graphql/queries";

import { listTrustBalances, listAccounts, listTrustTransactions } from "../graphql/queries";
//listDeposits,//listTrustTransactions,
//listTrustBalances,

//import { createDeposit, createTrustTransaction, createAccount } from "../graphql/mutations";
import { createTrustTransaction } from "../graphql/mutations";

//import { listDeposits } from "../../graphql/queries";
//import { deleteDeposit } from "../../graphql/mutations";

//import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "DepositIndex",
  async created() {
    //this.getDeposits();
    this.getAccounts();
    await this.getTrustBalancesAll();
  },
  data() {
    return {
      form: {
        dataDJF: "",
        dataAccounts: "",
        dataDeposits: "",
        dataTrustBalances: "",
        dataTrustTransactions: "",
        dataTrustTransactionsJP: "",
        commonAccountId: "",
        simpleDataDividendsJP: "",
        simpleAccountId: "",
      },
      apiName: "apif8da427c",

      path: "/inputdata",
      accounts: [],
      trustbalances: [],
      tbIndexByCode: new Map(),
      txIndexByTB: {}, // { [trustBalanceId]: Set<key> } key = `${noItem}|${basicPrice}`
      jpSkipped: [],
    };
  },
  methods: {
    summarizeRow(row) {
      if (!row || typeof row !== 'object') return '';
      const d = row['約定日'] || row['受渡日'] || row['日付'] || '';
      const t = row['取引'] || row['種別'] || '';
      const name = row['銘柄名'] || '';
      const code = row['銘柄コード'] || '';
      const amt = row['受渡金額(円)'] || row['受渡金額'] || row['利金・分配金・償還金'] || '';
      return `${d} ${t} ${name} ${code} ${amt}`.trim();
    },
    // 日本語の列名のCSVをパース（クォート対応）。ヘッダーなし行にも対応。
    parseJPBrokerCsv(text) {
      if (!text) return [];
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (!lines.length) return [];
      const defaultHeader = [
        '約定日','受渡日','口座','商品','取引','銘柄コード','銘柄名',
        '数量（株/口）/返済数量','単価/返済約定単価','手数料','税金(手数料消費税及び譲渡益税)',
        '利金・分配金・償還金','受渡金額(円)'
      ];
      const firstCols = this.splitCsvLine(lines[0]).map((h) => h.trim());
      // 先頭が日付(YYYY/MM/DD)っぽければヘッダー無しとみなす
      const looksLikeDate = /^\d{4}\/\d{2}\/\d{2}$/.test(firstCols[0] || '');
      // 先頭が既知ヘッダーならそれを使う
      const isHeader = !looksLikeDate && (firstCols[0] === '約定日' || firstCols.some(h => h.includes('約定日')));
      const header = isHeader ? firstCols : defaultHeader;
      const startIndex = isHeader ? 1 : 0;
      const rows = [];
      for (let i = startIndex; i < lines.length; i++) {
        const cols = this.splitCsvLine(lines[i]);
        const row = {};
        for (let j = 0; j < header.length; j++) {
          row[header[j]] = cols[j] !== undefined ? cols[j] : '';
        }
        rows.push(row);
      }
      return rows;
    },
    // 指定TBの既存トランザクションの (noItem,basicPrice) インデックスを用意
    async ensureTxIndexForTB(trustBalanceId) {
      if (!trustBalanceId) return new Set();
      if (this.txIndexByTB[trustBalanceId]) return this.txIndexByTB[trustBalanceId];
      const set = new Set();
      let nextToken = null;
      do {
        const res = await API.graphql({
          query: listTrustTransactions,
          variables: { filter: { trustBalanceId: { eq: trustBalanceId } }, limit: 100, nextToken },
        });
        const data = res?.data?.listTrustTransactions;
        const items = data?.items || [];
        for (const t of items) {
          const n = Number(t.noItem);
          const p = Number(t.basicPrice);
          if (!Number.isNaN(n) && !Number.isNaN(p)) {
            const key = `${n.toFixed(6)}|${p.toFixed(6)}`;
            set.add(key);
          }
        }
        nextToken = data?.nextToken || null;
      } while (nextToken);
      this.txIndexByTB[trustBalanceId] = set;
      return set;
    },
    // 取引種別の日本語→アプリ内Enum変換
    mapTradeTypeJP(v) {
      const t = String(v || '').trim();
      if (!t) return null;
      if (t === '分配金') return Enum.EnumTradeType.DIVIDEND.val;
      if (t === '再投資買付') return Enum.EnumTradeType.BUY.val;
      if (t === 'お買付') return Enum.EnumTradeType.BUY.val;
      if (t === 'かんたん積立') return Enum.EnumTradeType.BUY.val;
      if (t === '解約') return Enum.EnumTradeType.SELL.val;
      return null; // 未対応はスキップ
    },
    // コード文字列を正規化（数字のみ抽出）
    normalizeCode(s) {
      return String(s || '').replace(/\s+/g, '').replace(/[^0-9]/g, '');
    },
    // 口座種別→TrustBalanceType
    mapAccountTypeJP(v) {
      const t = String(v || '').trim();
      if (t === 'NISA') return 'NISA';
      if (t === '特定') return 'TOKUTEI';
      return null;
    },
    // 内部インデックスを再構築
    rebuildTbIndex() {
      const map = new Map();
      const items = Array.isArray(this.trustbalances) ? this.trustbalances : [];
      for (const tb of items) {
        const codeN = this.normalizeCode(tb.code);
        if (!codeN) continue;
        const arr = map.get(codeN) || [];
        arr.push(tb);
        map.set(codeN, arr);
      }
      this.tbIndexByCode = map;
    },
    // コード（＋可能なら口座種別=type）から trustBalanceId を検索（必要に応じてAPI検索）
    // 仕様: 口座種別が与えられる場合は type と code の両方が一致するものに限定して紐づける
    async findTrustBalanceIdByCode(codeRaw, accountTypeRaw) {
      const code = this.normalizeCode(codeRaw);
      if (!code) return null;
      const type = this.mapAccountTypeJP(accountTypeRaw);
      // まずローカルインデックス
      const byCode = (this.tbIndexByCode.get(code) || []).slice();
      if (byCode.length) {
        if (type) {
          const byCodeAndType = byCode.filter((tb) => String(tb.type || '') === type);
          if (byCodeAndType.length) return byCodeAndType[0].id; // type と code の両方一致
          // type 指定があるのに一致が無い場合は見つからない扱い（フォールバックしない）
        } else {
          // type 指定がなければ code 一致の先頭を採用
          return byCode[0].id;
        }
      }
      // --- サーバ検索 ---
      let found = null;
      // 優先: code eq (+ type eq)
      try {
        let nextToken = null;
        do {
          const filter = type
            ? { and: [{ code: { eq: code } }, { type: { eq: type } }] }
            : { code: { eq: code } };
          const res = await API.graphql({
            query: listTrustBalances,
            variables: { filter, limit: 100, nextToken },
          });
          const items = res?.data?.listTrustBalances?.items || [];
          nextToken = res?.data?.listTrustBalances?.nextToken || null;
          const arr = items.filter((i) => this.normalizeCode(i.code) === code && (!type || String(i.type || '') === type));
          if (arr.length) { found = arr; break; }
        } while (nextToken);
      } catch (e) {
        console.warn('[JP] listTrustBalances eq search failed', e);
      }
      // 次: code contains (+ type eq)
      if (!found) {
        try {
          let next = null;
          do {
            const filter = type
              ? { and: [{ code: { contains: code } }, { type: { eq: type } }] }
              : { code: { contains: code } };
            const res = await API.graphql({
              query: listTrustBalances,
              variables: { filter, limit: 100, nextToken: next },
            });
            const items = res?.data?.listTrustBalances?.items || [];
            next = res?.data?.listTrustBalances?.nextToken || null;
            const arr = items.filter((i) => this.normalizeCode(i.code) === code && (!type || String(i.type || '') === type));
            if (arr.length) { found = arr; break; }
          } while (next);
        } catch (e) {
          console.warn('[JP] listTrustBalances contains search failed', e);
        }
      }
      if (found && found.length) {
        this.trustbalances.push(...found);
        this.rebuildTbIndex();
        return found[0].id; // ここまで来た時点で type 条件も満たしている
      }
      return null;
    },
    // 文字列→数値（カンマ無視）。非数は null
    toNumberOrNull(s) {
      if (s === undefined || s === null) return null;
      const t = String(s).trim();
      if (!t) return null;
      const n = Number(t.replace(/,/g, ''));
      return Number.isNaN(n) ? null : n;
    },
    // A列（約定日）が無ければB列（受渡日）を使用し ISO へ
    pickDateISO(a, b) {
      const aISO = this.toSafeISO(a);
      if (aISO) return aISO;
      return this.toSafeISO(b);
    },
    async submitCreateTrustTransactionsFromJPText() {
      this.jpSkipped = [];
      const rows = this.parseJPBrokerCsv(this.form.dataTrustTransactionsJP);
      if (!rows.length) {
        alert('入力テキストに有効な行がありません');
        return;
      }
      if (!this.form.commonAccountId) {
        alert('共通アカウントを選択してください');
        return;
      }
      // trustBalances が未ロードならロード（全ページ）
      if (!this.trustbalances || this.trustbalances.length === 0) {
        await this.getTrustBalancesAll();
      }
      this.rebuildTbIndex();
      let ok = 0, skip = 0, skipDup = 0;
      for (let idx = 0; idx < rows.length; idx++) {
        const r = rows[idx];
        console.log(r);
        try {
          const tradeType = this.mapTradeTypeJP(r['取引']);
          if (!tradeType) { this.jpSkipped.push({ reason: '未対応の取引種別', row: r }); skip++; continue; }

          let trustBalanceId = await this.findTrustBalanceIdByCode(r['銘柄コード'], r['口座']);
          if (!trustBalanceId) {
            // 見つからない場合はAPIでフィルタ検索（eq/contains 併用）
            const codeN = this.normalizeCode(r['銘柄コード']);
            let nextToken = null; let found = null;
            do {
              const res = await API.graphql({
                query: listTrustBalances,
                variables: { filter: { code: { eq: codeN } }, limit: 100, nextToken },
              });
              const items = res?.data?.listTrustBalances?.items || [];
              nextToken = res?.data?.listTrustBalances?.nextToken || null;
              const arr = items.filter(i => this.normalizeCode(i.code) === codeN);
              if (arr.length) {
                found = arr;
                break;
              }
            } while (nextToken);
            // eq で見つからない場合 contains も試す
            if (!found) {
              let next = null;
              do {
                const res = await API.graphql({
                  query: listTrustBalances,
                  variables: { filter: { code: { contains: codeN } }, limit: 100, nextToken: next },
                });
                const items = res?.data?.listTrustBalances?.items || [];
                next = res?.data?.listTrustBalances?.nextToken || null;
                const arr = items.filter(i => this.normalizeCode(i.code) === codeN);
                if (arr.length) {
                  found = arr;
                  break;
                }
              } while (next);
            }
            if (found && found.length) {
              // キャッシュに追加
              this.trustbalances.push(...found);
              this.rebuildTbIndex();
              const type = this.mapAccountTypeJP(r['口座']);
              const candidates = found;
              if (type) {
                const m = candidates.find(tb => String(tb.type || '') === type);
                trustBalanceId = (m || candidates[0]).id;
              } else {
                trustBalanceId = candidates[0].id;
              }
            }
          }
          if (!trustBalanceId) { console.warn(`[JP] trustBalance not found by code:`, r['銘柄コード'], r); this.jpSkipped.push({ reason: '該当するTrustBalanceが見つからない', row: r }); skip++; continue; }

          const date = this.pickDateISO(r['約定日'], r['受渡日']);
          if (!date) { console.warn(`[JP] date missing`, r); this.jpSkipped.push({ reason: '日付が不正または欠損', row: r }); skip++; continue; }

          // 基準価格: 分配金の場合はなし（無視する）
          let basicPrice = this.toNumberOrNull(r['単価/返済約定単価']);
          let noItem = this.toNumberOrNull(r['数量（株/口）/返済数量']);
          const amountM = this.toNumberOrNull(r['受渡金額(円)']);
          const amountL = this.toNumberOrNull(r['利金・分配金・償還金']);

          const input = {
            accountId: this.form.commonAccountId,
            trustBalanceId,
            date,
            tradeType,
          };
          if (tradeType === Enum.EnumTradeType.DIVIDEND.val) {
            basicPrice = null; // 分配金時は基準価格を登録しない
            noItem = null;     // 分配金時は口数も登録しない
          }
          if (basicPrice !== null) input.basicPrice = basicPrice;
          if (noItem !== null) input.noItem = noItem;

          // 重複チェック: 同一 TB で (noItem, basicPrice) が同じなら登録しない
          if (input.noItem !== undefined && input.basicPrice !== undefined) {
            const set = await this.ensureTxIndexForTB(trustBalanceId);
            const key = `${Number(input.noItem).toFixed(6)}|${Number(input.basicPrice).toFixed(6)}`;
            if (set.has(key)) {
              skipDup++;
              this.jpSkipped.push({ reason: '重複と判断', row: r });
              continue;
            }
          }

          if (tradeType === Enum.EnumTradeType.BUY.val) {
            if (amountM !== null) input.buy = amountM;
          } else if (tradeType === Enum.EnumTradeType.SELL.val) {
            if (amountM !== null) input.sell = amountM;
          } else if (tradeType === Enum.EnumTradeType.DIVIDEND.val) {
            if (amountL !== null) input.dividend = amountL;
          }

          await API.graphql({
            query: createTrustTransaction,
            variables: { input },
          });
          // 追加済みキーをインデックスに反映
          if (input.noItem !== undefined && input.basicPrice !== undefined) {
            const set = await this.ensureTxIndexForTB(trustBalanceId);
            const key = `${Number(input.noItem).toFixed(6)}|${Number(input.basicPrice).toFixed(6)}`;
            set.add(key);
          }
          ok++;
        } catch (e) {
          console.error(`[JP] createTrustTransaction failed (row ${idx})`, e, rows[idx]);
          this.jpSkipped.push({ reason: '登録時エラー', row: r });
          skip++;
        }
      }

      alert(`JP TrustTransactions import finished. success=${ok}, duplicates=${skipDup}, skipped=${skip}`);
    },
    async submitCreateTrustTransactionsSimple() {
      const text = this.form.simpleDataDividendsJP;
      if (!text) { alert('テキストを入力してください'); return; }
      if (!this.form.simpleAccountId) { alert('アカウントを選択してください'); return; }
      // trustBalances が未ロードならロード
      if (!this.trustbalances || this.trustbalances.length === 0) {
        await this.getTrustBalancesAll();
      }
      // パース（先頭行をヘッダとして使用）
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
      if (!lines.length) { alert('有効な行がありません'); return; }
      const header = this.splitCsvLine(lines[0]).map(h => h.trim());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = this.splitCsvLine(lines[i]);
        const r = {};
        for (let j = 0; j < header.length; j++) r[header[j]] = cols[j] !== undefined ? cols[j] : '';
        rows.push(r);
      }
      let ok = 0, skip = 0;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        try {
          const codeRaw = String(r['銘柄コード'] || '').trim();
          if (!codeRaw) { skip++; continue; }
          // exact match (local)
          let trustBalanceId = null;
          const local = (this.trustbalances || []).find(tb => String(tb.code || '').trim() === codeRaw);
          if (local) trustBalanceId = local.id;
          // API exact
          if (!trustBalanceId) {
            try {
              let nextToken = null; let found = null;
              do {
                const res = await API.graphql({ query: listTrustBalances, variables: { filter: { code: { eq: codeRaw } }, limit: 100, nextToken } });
                const data = res?.data?.listTrustBalances;
                const items = data?.items || [];
                if (items.length) { found = items; break; }
                nextToken = data?.nextToken || null;
              } while (nextToken);
              if (found && found.length) {
                this.trustbalances.push(...found);
                this.rebuildTbIndex();
                trustBalanceId = found[0].id;
              }
            } catch (e) {
              console.warn('[Simple] listTrustBalances exact failed', e);
            }
          }
          // fallback normalized
          if (!trustBalanceId) trustBalanceId = await this.findTrustBalanceIdByCode(codeRaw, null);
          if (!trustBalanceId) { console.warn('[Simple] trustBalance not found', codeRaw, r); skip++; continue; }

          const date = this.toSafeISO(r['日付']);
          if (!date) { console.warn('[Simple] date missing', r); skip++; continue; }

          const amtRaw = r['受渡金額'] !== undefined ? r['受渡金額'] : r['受渡金額(円)'];
          const dividend = this.toNumberOrNull(amtRaw);
          if (dividend === null) { console.warn('[Simple] dividend missing', r); skip++; continue; }

          const input = {
            accountId: this.form.simpleAccountId,
            trustBalanceId,
            date,
            tradeType: Enum.EnumTradeType.DIVIDEND.val,
            dividend,
          };
          await API.graphql({ query: createTrustTransaction, variables: { input } });
          ok++;
        } catch (e) {
          console.error('[Simple] createTrustTransaction failed', e, r);
          skip++;
        }
      }
      alert(`Simple DIVIDEND import finished. success=${ok}, skipped=${skip}`);
    },
    // 全ページの trustBalances を読み込む
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
          // クォート外でも、3桁区切りのカンマは値の一部として扱うが、
          // 左側に英字が含まれる（例: コード MK256A001,645.23）の場合は区切りとみなす。
          const prev = cur.length ? cur[cur.length - 1] : '';
          const leftHasAlpha = /[A-Za-zＡ-Ｚａ-ｚ]/.test(cur);
          let j = i + 1;
          let digitsAhead = 0;
          while (j < line.length && /[0-9]/.test(line[j]) && digitsAhead < 4) { digitsAhead++; j++; }
          const nextChar = line[j] || '';
          const isThousandsComma = !leftHasAlpha && /[0-9]/.test(prev) && digitsAhead === 3 && !/[0-9]/.test(nextChar);
          if (isThousandsComma) {
            cur += ch; // 数値の桁区切り
          } else {
            out.push(cur);
            cur = '';
          }
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out.map(s => s.replace(/^"(.*)"$/, '$1')); // 外側の引用符を除去
    },
    // CSV全文を配列オブジェクトに変換
    // (removed) parseAccountsCsv, parseDepositsCsv — not used by current UI
    // 日付文字列を安全に ISO8601 に変換（無効/空/0 は null を返す）
    toSafeISO(s) {
      if (s === undefined || s === null) return null;
      const t = String(s).trim();
      if (!t || t === "0" || t.toLowerCase() === "null" || t.toLowerCase() === "undefined") return null;
      const d = new Date(t);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString();
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
    // getTrustBalances: not used from UI (use getTrustBalancesAll instead)
  },
};
</script>
