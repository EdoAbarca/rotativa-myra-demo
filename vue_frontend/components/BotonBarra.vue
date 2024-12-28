<script>
export default {

  props: ['tipo', 'link'],
  methods:{
    getLink(){
        return '/'+this.link
    }
  }
}
</script>
<template>
    
        <div class="fondo">
            
            <NuxtLink
                id="linkbarra" 
                class="btn from-center" 
                :to="getLink()"
                >{{ tipo }}
            </NuxtLink> 


        </div>   
        

</template>

<style>


/* ~~~~~~~ INIT. BTN ~~~~~~~ */
#linkbarra{
    color: #afdce4;
}
#linkbarra:hover{
    color: white;
}
.fondo{
    position: absolute;
    width: 200px;
    height: 40px;
    background-color:#48ABBF;
  

    
    border-radius: 0px 0px 30px 30px;
    
	font-family: 'arial';
    font-style: normal;
    font-weight: 700;
    font-size: 85%;
    line-height: 35px;
    display: flex;
    align-items: center;
    text-align: center;

    z-index: -10;
  
}
.btn {		
    width: 100%;
    height: 100%;
	position: absolute;	
    color: white;

	transition: all 500ms cubic-bezier(0.77, 0, 0.175, 1);	
	cursor: pointer;
	user-select: none;
    border-radius: 0px 0px 30px 30px;


    text-decoration: none;   
}

.btn:before, .btn:after {
	content: '';
	position: absolute;	
	transition: inherit;
	z-index: -1;
}

.btn:hover {
    
    color: white;
	transition-delay: .1s;   
}

.btn:hover:before {
	transition-delay: 0s;
    border: 5px solid #92DCEB;
    
}

.btn:hover:after {
	transition-delay: .05s;
}

.from-center:before {
    
	top: 0;
	left: 50%;
	height: 100%;
	width: 0;

    
	border: 0px solid #92DCEB;
    background-color: #92DCEB;
    border-radius: 0px 0px 30px 30px;
    z-index: -3;

    
    
}

.from-center:after {
	
	left: 0;
	height: 0;
	width: 100%;
	background: #005D71;
    border-radius: 0px 0px 30px 30px;

    
}

.from-center:hover:before {
	left: 0;
	width: 100%;
}

.from-center:hover:after {
	top: 0;

    background-color: #005D71;
	height: 100%;
}


.btn:focus{
    background-color: #005D71;

}



/* ~~~~~~~~~~~~ GLOBAL SETTINGS ~~~~~~~~~~~~ */

*, *:before, *:after {
	box-sizing: border-box;
}






</style>