
function addToCart(proId){
  
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count = $('#cart-count').html()
                count = parseInt(count)+1
                $("#cart-count").html(count)
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'item added to cart',
                    showConfirmButton: false,
                    timer: 1500
                  })
            }
            // alert(response)
        }
    })
}

