<template>
  <div>
    <h1>New Deposit with text</h1>

    <form @submit.prevent="submitCreate">
      <input type="submit" value="Submit" />

      <div class="mb-3">
        <div class="mb-3">
          <label for="" class="form-label">memo</label>
          <textarea class="form-control" v-model="form.memo" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">principal account *</label>
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
              v-for="n in refEnum.EnumDepositType"
              v-bind:key="n"
              v-bind:value="n.val"
            >
              {{ n.text }}
            </option>
          </select>
        </div>



        <button type="submit" class="btn btn-primary">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";

import { createDeposit } from "../../graphql/mutations";
import { listAccounts } from "../../graphql/queries";

//import { createDeposit, updateAccount } from "../../graphql/mutations";
//import { listAccounts } from "../../graphql/queries";

//import Datepicker from "vue3-datepicker";

import * as Enum from "@/Enum";
//import * as Enum from '../../enum';

export default {
  name: "DepositCreateText",
  async created() {
    this.getAccounts();
  },

  components: {
    //Datepicker,
  },
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      //picked: "",
      form: {
        //name: "a",
        name: "",
        //typeDeposit: Enum.EnumDepositeType.BUY_FOREIGN_CURRENCY_BY_JPY.val,
        //depositType: "BUY_FOREIGN_CURRENCY_BY_JPY",
        depositType: Enum.EnumDepositType.DEPOSIT.val,
        //typeDeposit

        memo: "",
        //status: "FINISHED",
        //status: "",

        //date: new Date(),

        date: "",
        //principalCurrency: "JPY",
        //principalJPY: 1000,
        principal: 0,
        //principalForeign: 0,
        //exchangeRate: 100.0,
        exchangeRate: 0,
        interestRate: 0,
        duration: 0,

        endDate: "",
        //valueCurrency: "USD",
        value: 0,
        //valueForeign: 10.0,
        //valueForeign: 0,
      },
      dPrincipalJPY: true,
      dPrincipalForeign: true,
      dExchangeRate: true,
      dInterestRate: true,
      dDuration: true,
      dEndDate: true,
      dValueCurrency: true,
      dValueJPY: true,
      dValueForeign: true,

      accounts: [],
      /*
      dPrincipalCurrecy: true,
*/
    };
  },
  methods: {
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
    disableAll: function () {
      this.dPrincipalCurrecy = true;
      this.dPrincipalJPY = true;
      this.dPrincipalForeign = true;
      this.dExchangeRate = true;
      this.dInterestRate = true;
      this.dDuration = true;
      this.dEndDate = true;
      this.dValueCurrency = true;
      this.dValueJPY = true;
      this.dValueForeign = true;
    },
    onChangeDepositType: function () {
      //console.log("xxxxxx");

      this.disableAll();

      this.form.status = Enum.EnumDepositStatus.ACTIVE.val;

      if (this.form.depositType == Enum.EnumDepositType.DEPOSIT_JPY.val) {
        this.dPrincipalJPY = false;
        this.dInterestRate = false;
        this.dDuration = false;
      } else if (this.form.depositType == Enum.EnumDepositType.DEPOSIT_FC.val) {
        this.dPrincipalForeign = false;
        this.dExchangeRate = false;
        this.dInterestRate = false;
        this.dDuration = false;
      } else if (
        this.form.depositType ==
        Enum.EnumDepositType.BUY_FOREIGN_CURRENCY_BY_JPY.val
      ) {
        this.dPrincipalJPY = false;
        this.dExchangeRate = false;
        this.form.duration = 0;
        this.dValueForeign = false;

        this.form.status = Enum.EnumDepositStatus.FINISHED.val;
      } else if (
        this.form.depositType ==
        Enum.EnumDepositType.BUY_FOREIGN_CURRENCY_BY_FC.val
      ) {
        this.dPrincipalForeign = false;
        this.dExchangeRate = false;
        this.form.duration = 0;
        this.dValueJPY = false;

        this.form.status = Enum.EnumDepositStatus.FINISHED.val;
      } else if (
        this.form.depositType == Enum.EnumDepositType.SELL_FOREIGN_CURRENCY.val
      ) {
        this.dPrincipalForeign = false;
        this.dExchangeRate = false;
        this.dInterestRate = false;
        this.form.duration = 0;
        this.dValueForeign = false;
        this.form.status = Enum.EnumDepositStatus.FINISHED.val;
      }
    },
    onChangePrincipalCurrency: function () {
      console.log("------1");

      var a = 0;
      for (const ka in this.accounts) {
        if (this.form.principalAccountId == this.accounts[ka].id) {
          console.log("------2");
          a = this.accounts[ka];
        }
      }
      console.log(a);

      //TODO; principal JPYとFCを分ける必要がないのでは？
      if (a.currency == "JPY") {
        this.dPrincipalJPY = false;
      } else {
        this.dPrincipalForeign = false;
      }
    },

    async submitCreate() {
      delete this.form.depositType;

      // console.log("----submit");
      // console.log(this.form);

      var memo = this.form.memo.replace(/\r\n|\r/g, "\n");
      var lines = memo.split("\n");
      //var outArray = new Array();

      for (var i = 0; i < lines.length; i++) {
        if (lines[i] == "") {
          continue;
        }

        console.log(lines[i]);
        var resultDate = /(預入日)\t(\d+\/\d+\/\d+)/.exec(lines[i]);
        if (resultDate != null) {
          //var tdate = resultDate[2].replaceAll(/\//,"-");
          //this.form.date = resultDate[2].replaceAll(/\//g,"-");
          this.form.date = new Date(resultDate[2]);
        }
        // console.log(resultDate);

        var resultEndDate = /(満期日)\t(\d+\/\d+\/\d+)/.exec(lines[i]);
        if (resultEndDate != null) {
          // this.form.endDate = resultEndDate[2].replaceAll(/\//g,"-");
          this.form.endDate = new Date(resultEndDate[2]);
        }

        var result = /(預入金額)\t([0-9,]+)/.exec(lines[i]);
        if (result != null) {
          this.form.principal = Number(result[2].replaceAll(/,/g, ""));
        }

        var result0 = /(商品名)\t(.+)/.exec(lines[i]);
        if (result0 != null) {
          this.form.name = result0[2];
        }

        var result1 = /(期間)\t([0-9]+)/.exec(lines[i]);
        if (result1 != null) {
          this.form.duration = Number(result1[2]);
        }

        //var result2 = /(金利\(税引前･年率\))\t(.+) /.exec(lines[i]);
        var result2 = /(\d\.\d+)/.exec(lines[i]);
        //console.log("----1223---");
        //console.log(result2);
        if (result2 != null) {
          this.form.interestRate = Number(result2[1]);
        }

      }

      //fix
      this.form.memo = "";
      this.form.status = Enum.EnumDepositStatus.ACTIVE.val;

      // console.log(this.form);

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