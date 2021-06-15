<template>
  <div>
    <h1>New Deposit</h1>

    <form @submit.prevent="submitCreate">
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
          <label for="" class="form-label">type *</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.depositType"
            @change="onChangeDepositType()"
            required
          >
            <option
              v-for="n in refEnum.EnumDepositeType"
              v-bind:key="n"
              v-bind:value="n.val"
            >
              {{ n.text }}
            </option>

            <option value="DEPOSIT_JPY">deposit jpy</option>
            <option value="DEPOSIT_FC">deposit fc</option>
            <option value="BUY_FOREIGN_CURRENCY_BY_JPY">
              buy foreign currency by JPY
            </option>
            <option value="BUY_FOREIGN_CURRENCY_BY_FC">
              buy foreign currency by FC
            </option>
            <option value="SELL_FOREIGN_CURRENCY">sell foreign currency</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label">memo</label>
          <textarea class="form-control" v-model="form.memo" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">date</label>
          <datepicker v-model="form.date" class="form-control" required />
          <!--             
             <datepicker  v-model="picked" />
          <input type="text" class="form-control" v-model="form.date" />
          -->
        </div>

        <div class="mb-3">
          <label for="" class="form-label">principalCurrency</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.principalCurrency"
            @change="onChangePrincipalCurrency()"
          >
            <!--
            <option selected>Open this select menu</option>-->
            <option
              v-for="n in refEnum.EnumCurrency"
              v-bind:key="n"
              v-bind:value="n.val"
            >
              {{ n.text }}
            </option>
            <!--
            <option value="JPY" selected>JPY</option>
            <option value="USD">USD</option>
            <option value="AUD">AUD</option>
            <option value="EUR">EUR</option>
            <option value="NZD">NZD</option>
            -->
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label">Principal JPY</label>
          <input
            type="number"
            class="form-control"
            v-model="form.principalJPY"
            v-bind:disabled="dPrincipalJPY"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">Principal Foreign</label>
          <input
            type="number"
            step="0.01"
            class="form-control"
            v-model="form.principalForeign"
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
          <label for="" class="form-label">valueCurrency</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.valueCurrency"
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
          <label for="" class="form-label">value JPY</label>
          <input type="text" class="form-control" v-model="form.valueJPY" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">value foreign</label>
          <input type="text" class="form-control" v-model="form.valueForeign" />
        </div>

        <button type="submit" class="btn btn-primary">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { createDeposit } from "../../graphql/mutations";

//import Datepicker from '../src/datepicker/Datepicker.vue'
//import { Datepicker } from 'vue3-datepicker';
//import { Datepicker } from 'vuejs-datepicker';
//import Datepicker from 'vuejs-datepicker/src/components/Datepicker.vue';
import Datepicker from "vue3-datepicker";
//import { ref } from 'vue';
//const picked = ref(new Date());

import * as Enum from "@/Enum";
//import * as Enum from '../../enum';

export default {
  name: "DepositCreate",

  components: {
    Datepicker,
  },
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      //picked: "",
      form: {
        name: "",
        memo: "",
        status: "",

        date: "",
        principalCurrency: "",
        principalJPY: 0,
        principalForeign: 0,
        exchangeRate: 0,
        interestRate: 0,
        duration: 0,

        endDate: "",
        valueCurrency: "JPY",
        valueJPY: 0,
        valueForeign: 0,
      },
    };
  },
  methods: {
    onChangePrincipalCurrency: function () {
      if (this.form.principalCurrency == "JPY") {
        this.dPrincipalJPY = true;
      } else {
        this.dPrincipalJPY = false;
      }
    },
    onChangeDepositType: function () {
      if (this.form.principalCurrency == "JPY") {
        this.dPrincipalJPY = true;
      } else {
        this.dPrincipalJPY = false;
      }
    },

    async submitCreate() {
      this.form.status = "ACTIVE";

      //this.form.duration = 12;

      /*
      let d = new Date();
      console.log(d.toISOString());
      this.form.date = d.toISOString();

      this.form.principalCurrency = "AUD";

      console.log(this.form);
      */

      console.log("xxxxxxxx");
      console.log(this.form.date);

      await API.graphql({
        query: createDeposit,
        variables: { input: this.form },
      })
        .then((result) => {
          console.log(result);
          this.$router.push({ name: "DepositIndex" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>