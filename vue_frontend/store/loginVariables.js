export const state = () => ({
    show: false
})

export const mutations = {
    cambiar(state){
        if(state.show === false){
            state.show = true
        }
        else{
            state.show = false
        }
        console.log(state.show)
    }
}