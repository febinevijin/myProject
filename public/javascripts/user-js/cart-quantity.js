
    function changeQuantity(cartId, proId, userId, count) {
        let quantity = parseInt(document.getElementById(proId).innerHTML)
        count = parseInt(count)
 
        $.ajax({
            url: '/change-product-quantity',
            data: {
                user:userId,
                cart: cartId,
                products: proId,
                count: count,
                quantity:quantity
            },
            method: 'post',
            success: (response) => {
                if(response.removeProduct){
                    alert("product removed from cart")
                    location.reload()
                }
               else{
                  
                   document.getElementById(proId).innerHTML=quantity+count
                   document.getElementById('total').innerHTML=response.total
               }
            }
        })
    }
