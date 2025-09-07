<template>
  <div>
    <h1>New TrustBalance</h1>

    <form @submit.prevent="submitCreate">
      <div class="mb-3">
        <label for="" class="form-label">currency *</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.currency"
          required
        >
          <option
            v-for="n in refEnum.EnumCurrency"
            v-bind:key="n"
            v-bind:value="n.val"
          >
            {{ n.text }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label for="" class="form-label">name *</label>
        <input type="text" class="form-control" v-model="form.name" required />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">memo</label>
        <textarea class="form-control" v-model="form.memo"></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">basicPrice *</label>
        <input
          type="number"
          class="form-control"
          v-model.number="form.basicPrice"
          step="any"
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label">noItem *</label>
        <input
          type="number"
          class="form-control"
          v-model.number="form.noItem"
          step="any"
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label">balance *</label>
        <input
          type="number"
          class="form-control"
          v-model.number="form.balance"
          step="any"
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label">平均取得価格 *</label>
        <input
          type="number"
          class="form-control"
          v-model.number="form.averagePurchasePrice"
          step="any"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">type</label>
        <select class="form-select" v-model="form.type">
          <option v-for="n in refEnum.EnumTrustBalanceType" :key="n" :value="n.val">
            {{ n.text }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">code</label>
        <input type="text" class="form-control" v-model="form.code" />
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";

import { createTrustBalance } from "../../graphql/mutations";

const GET_CREATE_TRUSTBALANCE_FIELDS = /* GraphQL */ `
  query __GetCreateTrustBalanceInput {
    __type(name: "CreateTrustBalanceInput") {
      inputFields { name }
    }
  }
`;

//import { createTrustBalance, updateAccount } from "../../graphql/mutations";
//import { listAccounts } from "../../graphql/queries";

//import Datepicker from "vue3-datepicker";

import * as Enum from "@/Enum";

export default {
  name: "TrustBalanceCreate",

  components: {
    //Datepicker,
  },
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      form: {
        currency: "",
        name: "",
        memo: "",
        basicPrice: 0,
        noItem: 0,
        balance: 0,
        averagePurchasePrice: null,
        type: "",
        code: "",
      },
    };
  },
  methods: {
    /*
    disableAll: function () {
      this.dBasicPrice = true;
      this.dBasicPriceForeign = true;
      this.dNoItem = true;

      this.dBuyJPY = true;
      this.dBuyForeign = true;
      this.dSellJPY = true;
      this.dSellForeign = true;
      this.dDividendJPY = true;
      this.dDividendForeign = true;
    },
    onChangeTrustBalanceType: function () {
      this.disableAll();

      //      this.form.status = Enum.EnumTrustBalanceStatus.ACTIVE.val;

      if (this.form.tradeType == Enum.EnumTradeType.BUY.val) {
        this.dBasicPrice = false;
        this.dBasicPriceForeign = false;
        this.dNoItem = false;

        this.dBuyJPY = false;
        this.dBuyForeign = false;
      } else if (this.form.tradeType == Enum.EnumTradeType.SELL.val) {
        this.dBasicPrice = false;
        this.dBasicPriceForeign = false;
        this.dNoItem = false;

        this.dSellJPY = false;
        this.dSellForeign = false;
      } else if (this.form.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
        this.dDividendJPY = false;
        this.dDividendForeign = false;
      }
    },
    onChangePrincipalCurrency: function () {
      if (this.form.principalCurrency == "JPY") {
        this.dPrincipalJPY = false;
      } else {
        this.dPrincipalForeign = false;
      }
    },
*/
    async submitCreate() {
      try {
        // 1) Introspect the schema to get the exact allowed fields for CreateTrustBalanceInput
        const introspection = await API.graphql({ query: GET_CREATE_TRUSTBALANCE_FIELDS });
        const fields = (introspection?.data?.__type?.inputFields || []).map((f) => f.name);
        if (!fields.length) {
          console.warn("[CreateTrustBalance] Introspection returned no fields. Falling back to conservative whitelist.");
        }

        // Conservative fallback whitelist if introspection is disabled
        const fallback = ["currency", "name", "memo", "basicPrice", "noItem", "balance", "averagePurchasePrice", "type", "code"];
        const allowed = fields.length ? new Set(fields) : new Set(fallback);

        // 2) Build candidate input from the form
        const candidate = {
          currency: this.form.currency,
          name: this.form.name,
          memo: this.form.memo,
          basicPrice: Number(this.form.basicPrice),
          noItem: Number(this.form.noItem),
          balance: Number(this.form.balance),
          averagePurchasePrice:
            this.form.averagePurchasePrice === null || this.form.averagePurchasePrice === ""
              ? null
              : Number(this.form.averagePurchasePrice),
          type: this.form.type,
          code: this.form.code,
        };

        // 3) Normalize strings (empty -> null) — numbers are already coerced above
        for (const k of ["currency", "name", "memo"]) {
          const v = candidate[k];
          if (typeof v === "string") {
            candidate[k] = v.trim() === "" ? null : v.trim();
          }
        }

        // 4) Filter to only allowed keys
        const input = Object.fromEntries(
          Object.entries(candidate).filter(([k, v]) => allowed.has(k) && v !== undefined)
        );

        // Guard required Float! fields
        const requiredFloat = ["basicPrice", "noItem", "balance"]; // schema requires these
        const missing = requiredFloat.filter((k) => input[k] === null || input[k] === undefined || Number.isNaN(input[k]));
        if (missing.length) {
          alert(`数値必須項目の未入力があります: ${missing.join(', ')}`);
          return;
        }

        const dropped = Object.keys(candidate).filter((k) => !allowed.has(k));
        if (dropped.length) {
          console.warn("[CreateTrustBalance] Dropped fields not in CreateTrustBalanceInput:", dropped);
        }

        // 5) Call mutation
        const result = await API.graphql({
          query: createTrustBalance,
          variables: { input },
        });

        console.log("[CreateTrustBalance] mutation result", result);
        this.$router.push({ name: "TrustBalanceIndex" });
      } catch (error) {
        try {
          console.error("GraphQL error", JSON.stringify(error, null, 2));
        } catch (_) {
          console.error(error);
        }
        alert(
          "作成に失敗しました。スキーマの入力項目と送信項目に不一致があります。コンソールの Dropped fields ログを確認してください。"
        );
      }
    },
  },
};
</script>