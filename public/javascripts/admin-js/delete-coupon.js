function deleteCoupon(couponId){
    if(confirm('Are you sure to want remove this coupon')){
       

      
  
    $.ajax({
        url: '/admin/delete',
        data:{
            coupon: couponId
            
        },
        method:'post',
        success: (response) => {
            alert("coupon is removed")
            location.reload()
        }
    })
}
}