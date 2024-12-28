//import { refresh_token } from "@nuxtjs/auth/lib/module/defaults";

export default function ({ $axios, app }) {

    $axios.onRequest((config) => {
      /* */
      const csrfToken = app.$cookies.get('csrftoken');
      console.log(csrfToken);
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    
      //const token = app.$auth.getToken('local');
      const token = localStorage.getItem('access');
      console.log(token);
      if (token){
        config.headers.common['Authorization'] = `Bearer ${token}`;
        //config.headers.common['Authorization'] = 'Bearer ' + token;
        console.log(config.headers.common['Authorization']);
      }
      return config;
    });
    /* 
    $axios.onResponse((config) => {
        const csrfToken = app.$cookies.get('csrftoken');
        console.log(csrfToken);
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken;
        }
        return config;
      });
    
      $axios.onResponse((response) => {
        const csrfToken = response.headers['X-CSRFToken'];
        console.log(csrfToken);
        if (csrfToken) {
          app.$cookies.set('csrftoken', csrfToken);
          config.headers['X-CSRFToken'] = csrfToken;
        }
        return response;
      });*/
  }