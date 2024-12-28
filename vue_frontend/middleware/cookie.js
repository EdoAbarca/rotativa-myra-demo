

// content of plugins/axios.js
/* 
// This is a global config declaration that works on any axios instance,
// meaning that if you just import axios from 'axios' in any place, you will get those.
// This will also work on the axios instance that nuxt creates and injects.

import axios from 'axios'

axios.defaults.xsrfHeaderName = 'x-csrftoken'
axios.defaults.xsrfCookieName = 'csrftoken'
*/
export default function ({ $axios }) {
    // This is a nuxt specific instance config, this will work in
    // everyplace where nuxt inject axios, like Vue components, and store
    $axios.defaults.xsrfHeaderName = 'X-CSRFToken'
    $axios.defaults.xsrfCookieName = 'csrftoken'
}

function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}