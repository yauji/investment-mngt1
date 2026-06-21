import { createStore } from 'vuex'

const defaultExchangeRates = {
  USD: 146.0,
  EUR: 170.0,
  AUD: 96.0,
  NZD: 87.0,
};

const loadExchangeRates = () => {
  if (typeof window === 'undefined') return defaultExchangeRates;
  try {
    const saved = JSON.parse(window.localStorage.getItem('investment-mngt.exchangeRates'));
    return saved && typeof saved === 'object'
      ? { ...defaultExchangeRates, ...saved }
      : defaultExchangeRates;
  } catch (_) {
    return defaultExchangeRates;
  }
};

export default createStore({
  state: {
    user: null,
    // 為替レートはSettingsで一元管理し、ブラウザ再読み込み後も維持する。
    exchangeRates: loadExchangeRates(),
  },
  mutations: {
    setUser(state, user){
      state.user = user;
    },
    // 為替レートを更新するmutation
    setExchangeRates(state, rates) {
      state.exchangeRates = { ...state.exchangeRates, ...rates };
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('investment-mngt.exchangeRates', JSON.stringify(state.exchangeRates));
        } catch (error) {
          console.warn('Failed to persist exchange rates', error);
        }
      }
    },
  },
  actions: {},
  modules: {
  }
})
