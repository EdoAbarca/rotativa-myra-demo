// https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-build
export default {
  // Env variables
  publicRuntimeConfig: {
    userURL: process.env.USER_URL,
    userField: process.env.USER_FIELD,
    loginURL: process.env.LOGIN_URL,
    loginField: process.env.LOGIN_FIELD,
    logoutURL: process.env.LOGOUT_URL,
    tokenRefreshURL: process.env.TOKEN_REFRESH_URL,

    registerURL: process.env.REGISTER_URL,
    profesionalURL: process.env.PROFESIONAL_URL,
    pacienteURL: process.env.PACIENTE_URL,
    coordinadorURL: process.env.COORDINADOR_URL,
    filterCenterURL: process.env.FILTER_CENTER_URL,
    filterPositionURL: process.env.FILTER_POSITION_URL,
    filterClientTypeURL: process.env.FILTER_CLIENT_TYPE_URL,
    filterTurnTypeURL: process.env.FILTER_TURN_TYPE_URL,
    cargaExcelURL: process.env.CARGA_EXCEL_URL,
    reporteProfesionalURL: process.env.REPORTE_PROFESIONAL_URL,
  },
  privateRuntimeConfig: {
    backendRoute: process.env.BACKEND_ROUTE,
    //cookieName: process.env.COOKIE_NAME,
  },

  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: true,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'server',

  // Configuracion servidor
  
  server: {
    host: "0.0.0.0"
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'vue_frontend',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    //'~/middleware/axios-config.js',
    //{ src: '~/middleware/csrf.js', mode: 'client' },
    //'~/middleware/cookie.js',
    //'~/middleware/axios.defaults.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/vuetify'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    //'@nuxtjs/auth-next',
    '@nuxtjs/auth',
    'cookie-universal-nuxt'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: process.env.BACKEND_ROUTE,
    withCredentials: true,
  },
  
  auth: {
    strategies: {
      local: {  
        scheme: 'local',
        localStorage: true,
        token: {
          property: 'access',
          maxAge: 30 * 60, //30 minutos
          name: 'Authorization',
          type: 'Bearer',
          global: true,
          required: true,
        },
        refreshToken: {
          property: 'refresh',
          maxAge: 60 * 60 * 24 // 1 dia
        },
        endpoints: {
          login: { url: process.env.LOGIN_URL, method: 'post', propertyName:process.env.LOGIN_FIELD},
          //user: { url: process.env.USER_URL, method: 'get' },
          user: false,
          //logout: { url: process.env.LOGOUT_URL, method: 'post' }
          logout: false,
        },
        //tokenRequired: true,
        //tokenType: 'Bearer',
        /* 
        user: {
          autoFetch: true,
          property: 'user'
          //property: process.env.USER_FIELD,
          //withCredentials: true,
          //autoLogout: true,
        },*/
      }
    }
  },

// Build Configuration: https://go.nuxtjs.dev/config-build
build: {
}
}
