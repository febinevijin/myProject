// function cancelOrder(orderId){
//     if(confirm('Are you sure to want remove this item from cart')){

    
//     $.ajax({
//         url: '/cancel-order',
//         data:{
//            order:orderId
           
//         },
//         method:'post',
//         success: (response) => {
//             if(response.removeProduct){
//                 alert("product removed from cart")
//                 location.reload()
//             }
//         }
//     })
// }
// }