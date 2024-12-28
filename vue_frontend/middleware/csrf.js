export default function ({ $axios }) {
  $axios.onRequest((config) => {
    const csrftoken = getCookie('csrftoken'); // Retrieve the current csrftoken value
    console.log(csrftoken);
    if (csrftoken) {
      config.headers['X-CSRFToken'] = csrftoken; // Set X-CSRFToken header
    }

    return config;
  });

  $axios.onResponse((response) => {
    const csrftoken = response.headers['csrftoken']; // Fetch the updated csrftoken value from response headers
    console.log(csrftoken);
    if (csrftoken) {
      setCookie('csrftoken', csrftoken); // Update the csrftoken value in the cookie
    }

    return response;
  });
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  console.log(value);
  console.log(parts);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value) {
  document.cookie = `${name}=${value}`;
}
