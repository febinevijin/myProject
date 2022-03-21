function addToWishlist(proId){
    
  
    $.ajax({
        url:'/add-to-wishlist/'+proId,
        method:'get',
        success:(response)=>{
            console.log(response)
            if(response.status){
                let count = $('#wishlist-count').html()
                count = parseInt(count)+1
                $("#wishlist-count").html(count)
                Swal.fire(
                   
                   'item added to wishlist',
                   
                  )
            }
            else if(response.exist){
                console.log(response.exist);
                Swal.fire('Item already exist in wishlist')
            }
            else{
                Swal.fire('login first')
            }
            
            // alert(response)
        }
    })
}