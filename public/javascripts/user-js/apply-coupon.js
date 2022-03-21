$('#ApplyCoupon').submit((e) => {
    alert('yayayayayayayay')
    e.preventDefault()
    $.ajax({
        url: '/applyCoupon',
        method: 'get',
        data: $('#ApplyCoupon').serialize(),
        success: (response) => {
            if (response.CoupenUsed) {
                document.getElementById('CouponMsg').innerHTML = "Coupon Already Used"
            }
            else if (response.Coupon) {
                let total = document.getElementById('tootal').innerHTML
                console.log(total);

                document.getElementById('CouponMsg').innerHTML = "Coupon Applied"
                document.getElementById("total").innerHTML=total-response.CoupDiscount

                document.getElementById("coupon").innerHTML = response.CoupDiscount
            }
            else if (response.NoCoupon) {
                document.getElementById('CouponMsg').innerHTML = "No Coupon Found"
            }
            else if (response.OneCouponUsed) {
                document.getElementById('CouponMsg').innerHTML = "Already One Coupon Used"
            }

        }
    })
})