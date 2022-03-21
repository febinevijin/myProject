// function removeCart(cartId,proId){

//     Swal.fire({
//         title: 'Are you sure?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, delete it!'
//       }).then((result) => {
//         if (result.isConfirmed) {

//             $.ajax({
//                 url: '/remove-cart',
//                 data:{
//                     cart: cartId,
//                     products:proId
//                 },
//                 method:'post',
//                 success: (response) => {
//                     if(response.removeProduct){
//                         alert("product removed from cart")
//                         location.reload()
//                     }
//                 }
//             })




//           Swal.fire(
//             'Deleted!',
//             'Your file has been deleted.',
//             'success'
//           )
//         }
//       })

    
  

// }


