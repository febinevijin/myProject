
const { Router } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const addressHelpers = require('../helpers/address-helpers');
const offerHelpers = require('../helpers/offer-helpers');
const { response } = require('../app');
const paypal = require('paypal-rest-sdk');
const res = require('express/lib/response');

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
  'AeL0JIg-SlL1H6X4jEjqfZFv_gTzi-8_YAlXgxm4TURJ72oB3tA9hS3wnJ894wb6_b0GizTrmqiO82D7',
  client_secret:
  'EH3vk2-htaJRL2Pt-t4uKJIK4sYr1QUNGwSHV2_97Y3R8p0T-FIM1PJLE7MNDtT0OlCKM6u0--avIFx6',
});

const verifyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

let accountSid = "AC402aadac49aa22be08ad7e85321df479";
let authToken = "0037e6f45c2467c8d4c1ec6b46b4235a"
const client = require('twilio')(accountSid, authToken);




/* GET home page. */
router.get('/',async function(req, res, next) {
  let user = req.session.user
  let cartCount = null
  let wishlistCount = null
  if(req.session.user){

    cartCount =await userHelpers.getCartCount(req.session.user._id)
    wishlistCount =await userHelpers.getWishlistCount(req.session.user._id)
  
  
    
  }

 let product=await productHelpers.getAllProductsHome()
 let offerProduct = await productHelpers.getOfferProduct()

 console.log(offerProduct,'lllllllllllllllllllllllllllllllll');

    
  res.render('user/home-page',{User:true,user,product,offerProduct,cartCount,wishlistCount});

});

//  GET PRODUCT PAGE
router.get('/view-products', function(req, res, next) {
  productHelpers.getAllProducts().then((product)=>{
   
    res.render('user/view-products',{User:true,product});
  })
  
});
    // USER LOGIN

router.get('/login',(req,res,next)=>{ 
  
  if(req.session.loggedIn){
    res.redirect('/')
  }else{ 
    res.render('user/login',{"loginErr":req.session.loginErr})
    req.session.loginErr= false
  }
 
})


router.get('/signup',(req,res,next)=>{
  res.render('user/signup')
})

// signup and  check already exist 

router.post('/signup',(req,res,next)=>{
  if(req.session.referId){
    req.body.referId=req.session.referId
  }
userHelpers.checkEmail(req.body).then((response)=>{

if(response.status){
 
    let Err  = response.err
res.render('user/signup',{Err})
  

 
}
else{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    res.render('user/login')
  })

}
}) 
})




// login page 

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    }else{
      req.session.loginErr = "Invalid email or password"
      res.redirect('/login')
    }
  }).catch((response)=>{
    let ErrMsg  = response.errMsg
    res.render('user/login',{ErrMsg})
  })
})

// logout


router.get('/logout',(req,res,next)=>{ 
  req.session.user =false
  req.session.loggedIn=false
  res.redirect('/')
})



// otp page
let OTP ;

router.get('/otplogin',(req,res,next)=>{
  // userHelpers.mobileCheck(req.body).then((user)=>{
  //   let number = req.body.number
  //   req.session.user = user

  //   client.messages
  // .create({
  //    body: random+ 'is your otp',
  //    from: '+19362377019',
  //    to: '+91'+number
  //  })
  //  .then((message)=> console.log(message));
  //  res.render('user/otp-login')
  // })

   res.render('user/otp-login')

 
})
// otp verification

router.post('/varify-number',(req,res,next)=>{

  userHelpers.mobileCheck(req.body.mobnumber).then((response)=>{
    
    if(response.status){
      req.session.user=response.user
      let number = req.body.mobnumber
      OTP = Math.floor(1000 + Math.random() * 9000)
      client.messages
  .create({
     body: OTP+ 'is your otp',
     from: '+19362377019',
     to: '+91'+number
   })
   .then((message)=> {});
          console.log(OTP);
          res.render('user/otp-submit')
    }
    else{
      let Moberr = "Invalid Mobile number"
    res.render('user/otp-login',{Moberr})
    }
 
  })
    
router.post('/varify-otp',(req,res,next)=>{

  console.log(OTP);
  console.log(req.body.otp);
  if(OTP == req.body.otp){
    res.redirect('/')
  }else{
    let err = "Invalid OTP"
    res.render('user/otp-submit',{err})
  }

})
})



 // GET CART
 router.get('/cart',verifyLogin,async(req,res)=>{
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  let user = req.session.user
   let product =await userHelpers.getCartProduct(req.session.user._id)

   let coupon = await offerHelpers.getUserCoupon()
      // console.log(product);
  res.render('user/cart',{User:true,user,product,coupon,totalValue})   
})

  // add to cart
  router.get('/add-to-cart/:id',(req,res)=>{
    console.log("api call");
    userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
      // res.redirect('/')
      res.json({status:true}) 
    })
  })
         
          // CART QUNTITY
  router.post('/change-product-quantity',(req,res,next)=>{
    // console.log(req.body);
   
    userHelpers.changeProductQuantity(req.body).then(async(response)=>{
      response.total = await userHelpers.getTotalAmount(req.body.user)
      res.json(response)
  
    })
  })

  // REMOVE CART 
  router.post('/remove-cart',(req,res,next)=>{
    // console.log(req.body);
   
    userHelpers.removeCartProduct(req.body).then((response)=>{
      res.json(response)
  
    })
  })

      //GET PLACE ORDER
      router.get('/place-order',verifyLogin,async(req,res)=>{
        let total = await userHelpers.getTotalAmount(req.session.user._id)
        

        let userDetails = await userHelpers.getUserDetails(req.session.user._id)
        let user = req.session.user
        // console.log(user)
      let address= await addressHelpers.getAllAddress(user)
       

        if(userDetails.couponamount){
          var grandTotal = total-userDetails
        }
        else{
          grandTotal = total
        }
        let discount = userDetails.couponamount

        let wallet= null
        if(userDetails.wallet !=0){
          wallet = userDetails.wallet
        }
       
        
        // console.log(total,'888888888888888888888888888888888888888888888888')
        res.render('user/place-order',{User:true,total,grandTotal,discount,address,user:req.session.user,wallet})
      })

     






      // POST PLACE ORDER
    router.post('/place-order',async(req,res)=>{
      // console.log(req.body.addressId,'ppppppppppppppppppppppppppppppppppppp');
      let product =  await userHelpers.getCartProductList(req.body.userId)
      let totalPrice = await userHelpers.getTotalAmount(req.body.userId)

      let delAddress = await addressHelpers.getdelAddress(req.body.addressId)
      // console.log(delAddress,'oooooooooooooooooooooooo');
      if(req.body.checked){
        let walletAmount = req.body.checked
        totalPrice = totalPrice-walletAmount
      }
      let discount = null
      let user = await userHelpers.getUserDetails(req.session.user._id)
      if(user.couponamount){
       discount=user.couponamount
       totalPrice = totalPrice - discount
      }
      console.log(totalPrice);

      let tot = parseFloat(totalPrice/75).toFixed(2)
  

  console.log(tot);
  req.session.totalAmount = tot

      userHelpers.placeOrder(req.body,product,totalPrice,delAddress).then((orderId)=>{
        
        if (req.body['payment-method'] === 'COD'){

          res.json({codSuccess:true})
        }else if (req.body['payment-method'] === 'ONLINE'){
          userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
            res.json(response)
          })
        }
        else {
          console.log('hi');
          const create_payment_json = {
            "intent": "sale",
            "payer": {
              "payment_method": "paypal",
            },
            "redirect_urls": {
              "return_url": "http://localhost:3000/success",
              "cancel_url": "http://localhost:3000/cancel",
            },
            "transactions": [
              {
                "item_list": {
                  "items": [
                    {
                      "name": orderId,
                      "sku": "001",
                      "price": tot,
                      "currency": "USD",
                      "quantity": 1,
                    },
                  ],
                },
                "amount": {
                  "currency": "USD",
                  "total": tot,
                },
                "description": "order for Menscart",
              },
            ],
          };
    
          paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
              throw error;
            } else {
              for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                  console.log(payment.links[i]);
                  res.json({ paypal:true, val: payment.links[i].href });
                }
              }
            }
          });
    
        }
      })
    })
    
    
    router.get("/success", (req, res) => {
      console.log('2');
      let orderId = req.query.orderId;
      let tot = req.session.totalAmount
      console.log(tot);
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
    
      const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [
          {
            "amount": {
              "currency": "USD",
              "total": tot,
            },
          },
        ],
      };
    
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(JSON.stringify(payment));
          userHelpers.changePaymentStatus(orderId).then(() => {
            res.redirect('/order-success')
          })
        }
      });
    });
    
    router.get('/cancel', (req, res) => {
      redirect('/')
    })





      // }) 
      // console.log(req.body);

    // })

    // GET ORDER-SUCCESS
    router.get('/order-success',verifyLogin,(req,res)=>{
      // console.log(req.session.user);
      
      res.render('user/order-success',{User:true,user:req.session.user})
    })

        // GET ORDER PAGE
        router.get('/orders',verifyLogin,async(req,res)=>{    
          let user=req.query.id
          // console.log(user);
          let orders = await userHelpers.getUserOrders(req.session.user._id)
          res.render('user/orders',{User:true,user:req.session.user,orders}) 
        })  

        // // VIEW ORDER PRODUCTS
        router.get('/view-order-product/:id',verifyLogin,async(req,res)=>{

          let product=await userHelpers.getOrderProduct(req.params.id)
         
          res.render('user/view-order-product',{User:true,user:req.session.user,product})
          
        })

        // CANCEL ORDER
        
   router.get('/cancel-ord',(req,res)=>{
     console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    let status= req.query.status
    let id = req.query.id  
 
    productHelpers.changeStatus(status,id).then((data)=>{
      console.log(data,'444444444444444444444444444444444444444444444444444444444444444444444'); 
      res.redirect('/orders')
    })
   })

        // GET MY ACCOUNT

        router.get('/profile',verifyLogin,async(req,res)=>{
         
          let user = req.session.user
          console.log(user);
          // console.log(user)
         await addressHelpers.getAllAddress(user).then((address)=>{
          console.log(address);
          res.render('user/profile',{User:true,user,address}) 
         })
         
        })

        //EDIT PROFILE

        router.get('/edit-profile',verifyLogin,(req,res)=>{
          let user= req.session.user
          res.render('user/edit-profile',{User:true,user})
        })

        // POST EDIT PROFILE
        router.post('/edit-profile',verifyLogin,(req,res)=>{
          let userId= req.session.user._id

          userHelpers.updateProfile(req.body,userId).then(()=>{
            res.redirect('/profile')
          })
        })

        // ADD ADDRESS
        router.get('/add-address',verifyLogin,(req,res)=>{
          let user = req.session.user
          res.render('user/add-address',{User:true,user})
        })

        //  POST ADD ADDRESS
        router.post('/add-address',verifyLogin,(req,res)=>{
          // console.log(req.body);
          addressHelpers.addAddresss(req.body).then((response)=>{
            // console.log(response)
            res.redirect('/profile')
          })
        })

          //GET EDIT ADDRESS
        router.get('/edit-address/:id',verifyLogin,async(req,res)=>{

          // console.log(req.params.id); 
          await addressHelpers.getOneAddress(req.params.id).then((address)=>{
            // console.log(address); 
            res.render('user/edit-address',{User:true,address})
          })
          
        }) 

        //  POST EDIT ADDRESS
        router.post('/edit-address',verifyLogin,async(req,res)=>{
            // console.log(req.body);
          await addressHelpers.updateAddress(req.body).then(()=>{    
            res.redirect('/profile')
          })

        })

        //   GET CHANGE PASSSWORD
        router.get('/change-password',verifyLogin,(req,res)=>{

          res.render('user/change-password',{User:true})
        })

        // POST CHANGE PASSWORD
        router.post('/change-password',verifyLogin,(req,res)=>{
          let userId= req.session.user._id
         

          userHelpers.changePassword(req.body,userId).then((response)=>{
            if(response.status){
              res.render('user/confirm-password',{User:true})
            }
            else{
              let passMsg  = response.passMsg
              res.render('user/change-password',{passMsg,User:true})
            }
          })
        })

        //  POST CONFIRM PASSWORD
          router.post('/confirm-password',verifyLogin,(req,res)=>{
            let userId= req.session.user._id
            userHelpers.confirmPassword(req.body,userId).then((response)=>{

                res.redirect('/')

            })
           
          })

          // VERIFY RAZORPAY PAYMENT 
          router.post('/verify-payment',(req,res)=>{
            // console.log(req.body);
            userHelpers.verifyPayment(req.body).then(()=>{
              userHelpers.changePaymentStatus(req.body['order[recipt]']).then(()=>{
                console.log('payment successful');
                res.json({status:true})
              })
            }).catch((err)=>{
              console.log(err);
              res.json({status:false,errMsg:'error occured'})
            })
          })


          // APPLY COUPON
          router.get('/applyCoupon', verifyLogin, (req, res) => {
            
            console.log(req.query,'111');
            console.log('apllyyyyyyyyyyy');
            // console.log(req.body);
            let userId = req.session.user._id
            // console.log(userId, '9999999');
            offerHelpers.checkCoupon(req.query.coupon, userId).then((response) => {
              res.json(response)
            })
          })

          // {---------------------------------product page-------------------------}
          router.get('/product-grid/:id',verifyLogin,async(req,res)=>{
            console.log(req.params.id,'00000000000000');
            let product =await productHelpers.getOneProduct(req.params.id)
            console.log(product);
            res.render('user/product-grid',{User:true,product})
          })
          
          // {====================================GET WISHLIST==================================}
          router.get('/wishlist',verifyLogin,async(req,res)=>{
            let totalValue = await userHelpers.getTotalAmount(req.session.user._id) 
            let product =await userHelpers.getWishlistProduct(req.session.user._id)
            res.render('user/wishlist',{User:true,totalValue,product})
          })

        // {============================================ADD TO WISHLIST================================}
            router.get('/add-to-wishlist/:id',(req,res)=>{
              console.log('newget 1')
              console.log(req.session.user,'000000000000000000');
              console.log('newget 2')
              userHelpers.addToWishlist(req.params.id,req.session.user._id).then((response)=>{
                console.log('newget 3')
                res.json(response)
              })
            })

          // {================================REMOVE WISHLIST==============================================}
          router.post('/remove-wishlist',(req,res,next)=>{

            userHelpers.removeWishlistProduct(req.body).then((response)=>{
              console.log(response,'9999999999999999999999999999999');
              res.json(response)
            })
          })

      // {=======================================PRODUCT LIST PAGE===============================================}
      router.get('/product-list', function(req, res, next) {
        productHelpers.getAllProducts().then((product)=>{
          console.log(product);
          
          res.render('user/product-list',{User:true,product});
        })
        
      });

      // {===========================================GET WALLET=====================================================}
      router.get('/wallet',verifyLogin,async(req,res)=>{
        let user=req.session.user
        let referId= user._id;
        let userId=user._id
        let referLink = `http://localhost:3000/signup/${referId}`
        
        let userDetails = await userHelpers.getUserWallet(userId)
        let wallet = null;
        if (userDetails.wallet) {
          wallet = userDetails.wallet
        }

        res.render('user/wallet',{User:true,user,wallet,referLink})
      })

      // {==============================================SIGN UP WITH REERAL==============================================}
      router.get('/signup/:id', (req, res) => {

        // console.log(req.params,'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
      
        req.session.referId = req.params.id;
        // console.log(req.session.referId,'11111111111111111111111');
        console.log(req.session.referId, 'referid signup get');
      
        res.render('user/signup')
      })


      // {=============================================== FILTER PRICE====================================================}
      router.get('/price-filter',(req,res)=>{
        console.log('i got it');
        let val1=parseInt(req.query.val1)
        let val2=parseInt(req.query.val2)
        userHelpers.getPriceFilter(val1,val2,req.query.cat).then((pro)=>{
          res.json(pro)
        })
      })
module.exports = router;
 