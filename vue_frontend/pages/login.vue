<script>
import { mapGetters } from "vuex";
import  ContenedorLogin  from "../components/ContenedorLogin.vue"
export default {
  name: "Login",
  middleware: "guest",
  components:{
    ContenedorLogin
  },
  data() {
    return {
      email: "",
      password: "",
    };
  }
 
};
</script>

<template>
  <div class="ContenedorPrincipal">
    <ContenedorLogin/>
  </div>
</template>


<style>

</style>