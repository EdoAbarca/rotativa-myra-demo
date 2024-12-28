<script>
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
        const res = await this.$axios.post(this.$config.registerURL, {
          username: this.username,
          email: this.email,
          password: this.password,
          repeatPassword: this.repeatPassword,
        });
      } catch (e) {
        console.log("Error", e.message);
      }
      
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
  <div class="contRegistro">

                <v-toolbar-title id="textoRegistro"
                  >Registro de usuario
                </v-toolbar-title>
            
              <v-card-text id="formularioRegistro">
                <v-form method="POST" >
                    <v-card-text>
                        <v-row id="col1" >
                            <v-col>
                                <v-text-field
                                    name="username"
                                    label="Usuario"
                                    type="text"
                                    v-model="username"
                                ></v-text-field>
                            </v-col>
                            
                            <v-col>
                                <v-text-field
                                    name="email"
                                    label="Correo electrónico"
                                    type="text"
                                    v-model="email"
                                ></v-text-field>
                            </v-col>
                  
                </v-row>
                  
              

                
                    </v-card-text>
                  
                    <v-card-text>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    id="password"
                                    name="password"
                                    label="Contraseña"
                                    type="password"
                                    v-model="password"
                                ></v-text-field>
                            </v-col>
                            <v-col>
                                <v-text-field
                                    id="repeatPassword"
                                    name="repeatPassword"
                                    label="Repetir contraseña"
                                    type="password"
                                    v-model="repeatPassword"
                                ></v-text-field>
                            </v-col>     
                  </v-row>

                    </v-card-text>
            
                  
                </v-form>

                
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn id="botonRegistro" @click="registerHandler">Registrarse</v-btn>
                <v-btn id="botonVolverRegistro" @click="cambiar('redirCenter1')">Volver</v-btn>
              </v-card-actions>
  </div>
</template>



<style>
#botonRegistro,#botonVolverRegistro{
    left: -5%;
    background-color: #CDCDCD;
    color: white;
    border-radius: 9px;
}
#botonRegistro{
    left: -7%;
    background-color: #48abbf;
}





.contRegistro{
    
    position: relative;
    width: 100%;
    top: 10%;

  font-family: Arial, Helvetica, sans-serif;
}
#textoRegistro {

    text-align: center;
    color: #005d71;
}

#boton {
  background-color: #48abbf;
  color: #ffffff;
  border-radius: 9px;
}
#bordeRegistro {
  background: #005d71;
  border-radius: 12px;
}

#cuerpoForm {
  border-radius: 12px;
  width: 100%;
}
#layout {
  width: 45%;
}

</style>