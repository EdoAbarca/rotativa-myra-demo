<script>
import { mapGetters, mapState } from "vuex";
export default {
  name: "Login",
  middleware: "guest",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  computed: {
    
    ...mapGetters({ isAuthenticated: "isAuthenticated" }),
  },
  mounted: function () {
    if (this.isAuthenticated) {
      this.$router.push("/home");
    }
  },
  methods: {
    ocultar(){

    },
    async loginHandler() {
      try {
        
        let res = await this.$auth.loginWith("local", {
          data: { 
            email: this.email, 
            password: this.password },
        });
        console.log(res);
        console.log(res.data);
        console.log(res.data.access);

        //this.$auth.setToken('local', res.data.access);
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        //this.$auth.setToken('local', 'refresh', refreshToken);
         /*let res = await this.$axios.post(process.env.LOGIN_URL, {
          email: this.email,
          password: this.password,
        });*/
      } catch (e) {
        console.log("Error:", e.message);
      }

      
      /*if (this.isAuthenticated) {
      this.$router.push("/home");
      } */
    },

    cambiar(id){
            if(id ==='redirCenter1'){
                document.getElementById('redirCenter1').style.zIndex = '1';
                document.getElementById('redirCenter1').style.opacity = '1';
                document.getElementById('redirCenter2').style.zIndex = '-100';
                document.getElementById('redirCenter2').style.opacity = '0';
                document.getElementById('redirCenter3').style.zIndex = '-100';
                document.getElementById('redirCenter3').style.opacity = '0';
            }
            if(id ==='redirCenter2'){
                document.getElementById('redirCenter2').style.zIndex = '1';
                document.getElementById('redirCenter2').style.opacity = '1';
                document.getElementById('redirCenter1').style.zIndex = '-100';
                document.getElementById('redirCenter1').style.opacity = '0';

            }

            if(id ==='redirCenter3'){
                document.getElementById('redirCenter3').style.zIndex = '1';
                document.getElementById('redirCenter3').style.opacity = '1';
                document.getElementById('redirCenter1').style.zIndex = '-100';
                document.getElementById('redirCenter1').style.opacity = '0';

            }
            
        }
  },
};
</script>

<template>
    <div class="contLogin" >
        <v-card id="tarjetaLogin" elevation="0">
              <v-toolbar-title id="textoInicioSesion">Inicio de sesión</v-toolbar-title>

              <v-card-text>
                <v-form id="formLogin" method="POST">
                  <v-text-field variant="solo-filled" name="email" label="Correo electrónico" type="text" v-model="email"></v-text-field>
                  <v-text-field id="passwordLogin" name="password" label="Contraseña" type="password" v-model="password"> </v-text-field>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn id="botonInicioLogin" type="submit" @click="loginHandler">Iniciar sesión</v-btn>
                <v-btn id="botonVolverLogin" @click= "cambiar('redirCenter1')">Volver</v-btn>
              </v-card-actions>   

        </v-card>

</div>
            
</template>


<style>

#botonInicioLogin,#botonVolverLogin{

    background-color: #CDCDCD;
    color: white;
    border-radius: 9px;
}
#botonInicioLogin{

    background-color: #48abbf;
}
#formLogin{

    position: relative;
    width: 87%;
}
#bordeInicioSesion {

  background: #005d71;
  border-radius: 12px 12px 0px 0px;
}

#textoInicioSesion {
    text-align: center;
    color: #005d71;
}

.botonAcceso {
  background-color: #48abbf;
  color: #ffffff;
  border-radius: 9px;
}

#cuerpoForm {
  border-radius: 12px;
}
.contLogin {


  position: relative;
  width: 100%;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #005d71;
}
</style>