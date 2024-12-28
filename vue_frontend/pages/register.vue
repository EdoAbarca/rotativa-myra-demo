<script>
import  ContenedorRegistro  from "../components/ContenedorRegistro.vue"
export default {
  name: "Signup",
  middleware: "guest",
  head() {
    return {
      title: "Registro - Rotativa Myra",
    };
  },
  data() {
    return {
      username: "",
      email: "",
      password: "",
      repeatPassword: "",
    };
  },
  components:{
    ContenedorRegistro
  },
  methods: {
    async registerHandler() {
      const data = {
        username: this.username,
        email: this.email,
        password: this.password,
        repeatPassword: this.repeatPassword,
      };
      console.log(data);
      try {
        const res = await this.$axios.post("/register", {
          username: this.username,
          email: this.email,
          password: this.password,
          repeatPassword: this.repeatPassword,
        });
      } catch (e) {
        console.log("Error", e.message);
      }
    },
  },
};
</script>

<template>
  <div class="ContenedorPrincipal">
    <ContenedorRegistro/>
  </div>
</template>



<style>
</style>