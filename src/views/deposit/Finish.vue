<template>
  <div>
    <h1>Finish deposit</h1>

    <form @submit.prevent="submitUpdate">
      <input type="submit" value="Submit" />

      <div class="mb-3">
        <div class="mb-3">
          <label for="" class="form-label">name *</label>
          <input
            type="text"
            class="form-control"
            v-model="form.name"
            required
            disabled
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">memo</label>
          <textarea class="form-control" v-model="form.memo" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">date</label>
          <datepicker v-model="form.date" class="form-control" />
        </div>
        <div class="mb-3">
          <label for="" class="form-label">principal account</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.principalAccountId"
            @change="onChangePrincipalCurrency()"
            required
          >
            <option
              v-for="n in this.accounts"
              v-bind:key="n"
              v-bind:value="n.id"
            >
              {{ n.currency }} - {{ n.name }}
            </option>
          </select>
        </div>
        <!--
-->
        <div class="mb-3">
          <label for="" class="form-label">Principal</label>
          <input
            type="number"
            step="0.01"
            class="form-control"
            v-model="form.principal"
            v-bind:disabled="true"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">exchange rate</label>
          <input
            type="number"
            class="form-control"
            v-model="form.exchangeRate"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">interest rate</label>
          <input
            type="number"
            class="form-control"
            v-model="form.interestRate"
            step="0.01"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">duration</label>
          <input type="text" class="form-control" v-model="form.duration" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">end date *</label>
          <datepicker v-model="form.endDate" class="form-control" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">value account</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.valueAccountId"
            @change="onChangePrincipalCurrency()"
          >
            <option
              v-for="n in this.accounts"
              v-bind:key="n"
              v-bind:value="n.id"
            >
              {{ n.currency }} - {{ n.name }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label">value </label>
          <input
            type="number"
            step="0.01"
            class="form-control"
            v-model="form.value"
            v-bind:disabled="dValue"
          />
        </div>

        <button type="submit" class="btn btn-primary">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { getDeposit, listAccounts } from "../../graphql/queries";
import { updateDeposit } from "../../graphql/mutations";

import Datepicker from "vue3-datepicker";

import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "DepositFinish",
  components: {
    Datepicker,
  },
  props: {
    depositId: String,
  },
  async created() {
    this.getDeposit();
    this.getAccounts();
  },
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      form: {
        name: "",
        memo: "",
        date: null,
        endDate: null,
        principalAccountId: null,
        valueAccountId: null,
        principal: null,
        exchangeRate: null,
        interestRate: null,
        duration: "",
        value: null,
      },
      accounts: [],
      dValue: false,
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
    },
    async getDeposit() {
      //console.log(this.depositId);

      await API.graphql({
        query: getDeposit,
        variables: { id: this.depositId },
      })
        .then((result) => {
          const dep = result.data.getDeposit;
          // merge while preserving defaults for missing fields
          this.form = { ...this.form, ...dep };
          this.form.date = dep && dep.date ? new Date(dep.date) : null;
          this.form.endDate = dep && dep.endDate ? new Date(dep.endDate) : null;
        })
        .catch((error) => {
          console.log(error);
        });
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
    onChangePrincipalCurrency() {
      // no-op for now; keep method to avoid runtime warnings
      // You can add currency-based validation here later if needed.
    },
    async submitUpdate() {
      const toDateStr = (v) => (v instanceof Date && !isNaN(v) ? moment(v).format("YYYY-MM-DD") : null);
      const toNum = (v) => {
        if (v === null || v === undefined || v === "") return null;
        const n = typeof v === "number" ? v : parseFloat(v);
        return Number.isFinite(n) ? n : null;
      };

      // Start from current form state
      const payload = { ...this.form };

      console.log('[Finish] raw form -> payload(before normalize):', payload);

      // Ensure id is present for update
      if (!payload.id && this.depositId) payload.id = this.depositId;

      // Remove read-only / relation objects if present
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.owner;
      delete payload.principalAccount;
      delete payload.valueAccount;

      // Normalize types
      payload.principal = toNum(payload.principal);
      payload.exchangeRate = toNum(payload.exchangeRate);
      payload.interestRate = toNum(payload.interestRate);
      payload.value = toNum(payload.value);

      // Dates -> string (GraphQL scalar)
      payload.date = toDateStr(this.form.date);
      payload.endDate = toDateStr(this.form.endDate);

      // Deposit status -> enum (fallback to string literal if your Enum helper differs)
      payload.status = (Enum?.EnumDepositStatus?.FINISHED?.val) ?? (Enum?.EnumDepositStatus?.FINISHED) ?? "FINISHED";

      delete payload.__typename;
      delete payload._lastChangedAt;
      delete payload.createdBy;

      // Build a strict whitelist for UpdateDepositInput
      const allowedKeys = [
        'id',
        'name',
        'memo',
        'date',
        'endDate',
        'principalAccountId',
        'valueAccountId',
        'principal',
        'exchangeRate',
        'interestRate',
        'duration',
        'value',
        'status',
        '_version', // keep for AppSync conflict detection when present
      ];
      const input = {};
      for (const k of allowedKeys) {
        const v = payload[k];
        if (v !== undefined && v !== '') input[k] = v; // allow null for nullable scalars; skip empty strings
      }

      console.log('[Finish] updateDeposit input:', input);

      try {
        const result = await API.graphql({
          query: updateDeposit,
          variables: { input },
        });
        console.log(result);
        this.$router.push({ name: "DepositIndex" });
      } catch (error) {
        console.error('[Finish] update failed:', error);
        if (error && error.errors) {
          for (const e of error.errors) {
            console.error('[Finish] graphql error:', e.message, e);
          }
        }
      }
    },
  },
};
</script>