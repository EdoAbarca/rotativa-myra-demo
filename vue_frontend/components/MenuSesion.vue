<script>


export default {
  props:['page'],
  data() {
    return {

 
            menu: false,
            message: false,
            
            valid: true,
        show1: false,
        show2: true,

        password1: '',
        password2: '',
        rules: {
          required: value => !!value || 'Requerido.',
          min: v => v.length >= 8 || 'Mínimo 8 caracteres',
        },
    };
  },
  components: {
  },
  methods: {
      validate () {
        this.$refs.form.validate()
      },
      reset () {
        this.message = false
        this.password1=''
        this.password2 = ''
      },
      async logoutHandler() {
      try {
        let res = this.$axios.post(this.$config.logoutURL, {
          refresh: localStorage.getItem("refresh")}, 
          {
            headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
          }
        );
        console.log(res);
        await this.$auth.logout();
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        this.$nuxt.refresh();
      } catch (e) {
        console.log("Error: ", e.message);
      }
    },
  },
};
</script>
<template>
   


  <div class="text-center">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      left
      max-width ="250px"
      offset-y
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            fab
            width="35px"
            height="35px"
            color="#48ABBF"
            elevation="1"
            dark
            v-bind="attrs"
            v-on="on"
        >
        <v-icon
            medium
            color="white"
            >
            mdi-account-settings
        </v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-list><v-list-item>
        <v-list-item-avatar>
              <img
                src="https://cdn.vuetifyjs.com/images/john.jpg"
                alt="John"
              >
        </v-list-item-avatar>
        <v-list-item-content>
            <v-list-item-title>Fernanda</v-list-item-title>
            <v-list-item-subtitle>Herrera Soto</v-list-item-subtitle>
        </v-list-item-content>

        </v-list-item></v-list>

        <v-divider></v-divider>
        <v-list>
          <v-list-item>
            <v-list-item-action>
              <v-btn
                v-model="message"
                text
                @click="message = !message"
              > Cambiar Contraseña</v-btn>
            </v-list-item-action>
          </v-list-item>

          <v-list-item v-if="message" >
            <v-form
                ref="form"
                v-model="valid"
                lazy-validation
                >
                <div id="passActualContainer">
                    <v-text-field
                        dense
                        v-model="password1"
                        :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[rules.required, rules.min]"
                        :type="show1 ? 'text' : 'password'"
                        name="input-10-1"
                        label="Contraseña Actual"
                        hint="Mínimo 8 caracteres"
                        @click:append="show1 = !show1"
                ></v-text-field>
                </div>
                    <v-text-field
                        v-model="password2"
                        :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[rules.required, rules.min]"
                        :type="show2 ? 'text' : 'password'"
                        name="input-10-1"
                        label="Contraseña Nueva"
                        hint="Mínimo 8 caracteres"
         
                        @click:append="show2 = !show2"
                    ></v-text-field>
                    
                    <v-row >
                        <v-col justify="center" align="center">
                            <v-btn
                                width="60px"
                                :disabled="!valid"
                                color="success"
                                @click="validate"
                            >Cambiar</v-btn>

                            <v-btn
                                width="60px"
                                color="error"
                                @click="reset"
                            >cancelar</v-btn>
                        </v-col>
                    </v-row>
                    

                    
                </v-form>

                

          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-card-actions class="justify-center">
          <v-btn
            text
            @click="logoutHandler"
          >
            Cerrar Sesión
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-menu>
  </div>

</template>
<style>
#passActualContainer{

    height: 50px;
}

</style>
