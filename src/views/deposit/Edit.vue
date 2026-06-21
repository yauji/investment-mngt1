<template>
  <div>
    <h1>Edit deposit</h1>

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
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">status *</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.status"
            required
          >
            <!--
            <option value="ACTIVE">ACTIVE</option>
            <option value="FINISHED">FINISHED</option>
-->

            <option
              v-for="n in refEnum.EnumDepositStatus"
              v-bind:key="n"
              v-bind:value="n.val"
            >
              {{ n.text }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label">memo</label>
          <textarea class="form-control" v-model="form.memo" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">date</label>
          <datepicker v-model="form.date" class="form-control" />
          <!--
          <input text="text" v-model="form.date"/>
             -->
        </div>

        <div class="mb-3">
          <label for="" class="form-label">principal account</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.principalAccountId"
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
          <label for="" class="form-label">Principal</label>
          <input
            type="number"
            class="form-control"
            v-model="form.principal"
            step="0.01"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">exchange rate</label>
          <input
            type="number"
            class="form-control"
            v-model="form.exchangeRate"
            step="0.01"
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
          <label for="" class="form-label">end date</label>
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
  name: "DepositEdit",
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
        id: this.depositId,
        name: '',
        status: Enum?.EnumDepositStatus?.ACTIVE?.val || 'ACTIVE',
        memo: '',
        date: null,
        endDate: null,
        principalAccountId: '',
        valueAccountId: '',
        principal: 0,
        exchangeRate: null,
        interestRate: null,
        duration: 0,
        value: null,
      },
      accounts: [],
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
          const dep = result.data.getDeposit || {};
          const toDate = (v) => {
            if (!v) return null;
            const d = new Date(v);
            return Number.isNaN(d.getTime()) ? null : d;
          };
          this.form = {
            id: dep.id,
            name: dep.name || '',
            status: dep.status || (Enum?.EnumDepositStatus?.ACTIVE?.val || 'ACTIVE'),
            memo: dep.memo || '',
            date: toDate(dep.date),
            endDate: toDate(dep.endDate),
            principalAccountId: dep.principalAccountId || '',
            valueAccountId: dep.valueAccountId || '',
            principal: dep.principal != null ? Number(dep.principal) : 0,
            exchangeRate: dep.exchangeRate != null ? Number(dep.exchangeRate) : null,
            interestRate: dep.interestRate != null ? Number(dep.interestRate) : null,
            duration: dep.duration != null ? Number(dep.duration) : 0,
            value: dep.value != null ? Number(dep.value) : null,
          };
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
    async submitUpdate() {
      const formatDate = (v) => {
        if (!v) return null;
        const d = v instanceof Date ? v : new Date(v);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString().slice(0, 10);
      };
      const toNumber = (v, fallback = null) => {
        if (v === '' || v === null || v === undefined) return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
      };
      const input = {
        id: this.form.id,
        name: this.form.name,
        status: this.form.status,
        memo: this.form.memo || '',
        date: formatDate(this.form.date),
        endDate: formatDate(this.form.endDate),
        principalAccountId: this.form.principalAccountId || null,
        valueAccountId: this.form.valueAccountId || null,
        principal: toNumber(this.form.principal, 0),
        exchangeRate: toNumber(this.form.exchangeRate),
        interestRate: toNumber(this.form.interestRate),
        duration: toNumber(this.form.duration, 0),
        value: toNumber(this.form.value),
      };
      if (input.duration !== undefined) {
        input.duration = Math.trunc(input.duration);
      }

      Object.keys(input).forEach((key) => {
        if (input[key] === null || input[key] === undefined) delete input[key];
      });

      try {
        const result = await API.graphql({
          query: updateDeposit,
          variables: { input },
        });
        console.log(result);
        this.$router.push({ name: "DepositIndex" });
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>
