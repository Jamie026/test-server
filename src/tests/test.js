const array = [[{},{}],[]];

if(array.length===1){
    if(array[0].length>=1){
        console.log("negativizando la campaña")
    }else{
        console.log("no hay campañas por negatiivizar")
    }
}else{
    array.forEach((a)=>{
        console.log("negativzando campaña por campaña");
    });
}

console.log(array.length);