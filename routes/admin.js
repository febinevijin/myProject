const { Router } = require('express');
var express = require('express');
var productHelpers = require('../helpers/product-helpers');
var userHelpers = require('../helpers/user-helpers');
const offerHelpers = require('../helpers/offer-helpers');
const orderHelpers = require('../helpers/order-helpers');
var router = express.Router();


var adminLogin = {
  name: 'Admin',
  emailId: 'admin@gmail.com',
  password: 'admin'
}

/* GET users listing. */
router.get('/',async function(req, res, next) {
if(req.session.login){
  let profit= await orderHelpers.getTotalProfit()
  let totalOrders=await orderHelpers.TotalOrderCount()
  let totalProductCount=await productHelpers.getAllProductsCount()
  let totalUsers=await userHelpers.getAllUsersCount()
  let products = await productHelpers.getProDetails()

  let razorPayTotal=await orderHelpers.getrazroPayTotal()
  let codTotal=await orderHelpers.getCodTotal()
  let paypalTotal=await orderHelpers.getPaypalTotal()



  res.render('admin/dashboard',{admin:true,profit,totalOrders,totalProductCount,totalUsers,razorPayTotal, codTotal,paypalTotal,products});
}else{
  res.redirect('/admin/login')
}
  
});

/* GET product listing. */
router.get('/product-list', function(req, res, next) {
  productHelpers.getAllProducts().then((product)=>{
    console.log(product);
    res.render('admin/product-list',{admin:true,product});
  })

 
});

/* GET add product . */
router.get('/add-product', function(req, res, next) {

  res.render('admin/add-product',{admin:true});
});

// post add products
router.post('/add-product', function(req, res, next) {
  
  productHelpers.addProduct(req.body,(id)=>{
    let image = req.files.image
    let image1 = req.files.image1
    let image2 = req.files.image2
    let image3 = req.files.image3
    let image4 = req.files.image4
    let image5 = req.files.image5
    
    image.mv('./public/images/'+id+'.jpeg')
    image1.mv('./public/images/'+id+'.image1.jpeg')
    image2.mv('./public/images/'+id+'.image2.jpeg')
    image3.mv('./public/images/'+id+'.image3.jpeg')
    image4.mv('./public/images/'+id+'.image4.jpeg')
    image5.mv('./public/images/'+id+'.image5.jpeg')

    res.render('admin/add-product', {admin:true})
  
  })
});




// edit & delete product page
router.get('/edit-products', function(req, res, next) {
  productHelpers.getAllProducts().then((product)=>{
    console.log(product);
    res.render('admin/edit-products',{admin:true,product});
  })
});

          //delete product


          router.get('/delete-product/:id',(req,res)=>{
            let proId = req.params.id
            productHelpers.deleteProduct(proId).then((response)=>{
              res.redirect('/admin/edit-products')
            })
          })

// edit page

router.get('/edit-section/:id',async(req,res)=>{
  let product = await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-section',{admin:true,product})
})

// edit-section-page

router.post('/edit-section/:id',(req,res)=>{
  let id= req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/edit-products')

     

    if(req.files.image){ 
      let image= req.files.image

      image.mv('./public/images/'+id+'.jpeg')

    }
    
  }) 
}) 

// view users


router.get('/view-users', function(req, res, next) {
  userHelpers.getAllUsers().then((users)=>{
  //   console.log(product);
    res.render('admin/view-users',{admin:true,users});
  })
});









 
// admin login post






router.get('/logout',(req,res)=>{
 
    req.session.login = false
    res.render('admin/admin-login')

});


router.get('/login',(req,res)=>{

   
    res.render('admin/admin-login')

});




router.post('/login', (req, res) => {
  if (adminLogin.emailId == req.body.email && adminLogin.password == req.body.password) {
   req.session.login = true
   req.session.email = req.body.email
   req.session.password = req.session.password 
   req.session.name = adminLogin.name
   let data = req.session.name
   res.redirect('/admin')
 }
  else { 
   var error = 'Invalid username or password..'
   res.render('admin/admin-login',{error})
 } 
})

  // GET USER BLOCK
  router.get('/block/:id',(req,res)=>{
    userHelpers.blockUser(req.params.id).then((response)=>{
      res.redirect('/admin/view-users')
    })
  })
  // GET USER   UNBLOCK
  router.get('/unblock/:id',(req,res)=>{
    userHelpers.unblockUser(req.params.id).then((response)=>{
      res.redirect('/admin/view-users')
    })
  })

   // GET ORDER
   router.get('/admin-orders',(req,res)=>{
    productHelpers.getOrderDetails().then((orders)=>{
      // console.log(orders);
      res.render('admin/admin-orders',{admin:true,orders})
    })
   })

   // CHANGE STATUS ORDER
   router.get('/status-change',(req,res)=>{
    let status= req.query.status
    let id = req.query.id  
 
    productHelpers.changeStatus(status,id).then((data)=>{
      console.log(data,'444444444444444444444444444444444444444444444444444444444444444444444'); 
      res.redirect('/admin/admin-orders')
    })
   })

   // GET OFFERS
   router.get('/coupon',(req,res)=>{ 
      offerHelpers.getAllCoupon().then((coupon)=>{
    console.log(coupon);
     res.render('admin/coupon',{admin:true,coupon})
   })

   // GET ADD COUPON
   router.get('/add-coupon',(req,res)=>{
  
      res.render('admin/add-coupon',{admin:true})
    })
  
  })

  //POST ADD COUPON
  router.post('/add-coupon',(req,res)=>{
    offerHelpers.addCoupon(req.body).then(()=>{
      res.redirect('/admin/coupon')
    })
  })
  // delete coupon

  router.post('/delete',(req,res,next)=>{
    
    offerHelpers.deleteCoupon(req.body).then((response)=>{
      // console.log(req.body,'%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');  
      res.json(response)
    })
  })
     

      // GET  SALES  REPORT
      router.get('/salesreport',async(req,res)=>{
        let salesreport =await  orderHelpers.getsalesReport()
        console.log(salesreport,'sasasssasas');
        res.render('admin/salesreport',{admin:true,salesreport})
      })

      router.post('/salesreport/report', async (req, res) => {
        // console.log('i reached here')
        let salesReport = await orderHelpers.getSalesReport(req.body.from, req.body.to)
        // console.log('salesReport')
        // console.log(salesReport)
        res.json({ report: salesReport })
      })
      
    
      router.post('/salesreport/monthlyreport', async (req, res) => {
          
        let singleReport = await orderHelpers.getNewSalesReport(req.body.type)
        // console.log(singleReport,'sssssssssssssss');
        res.json({ wmyreport: singleReport })
      })

      // {=====================================GET PRODUCT OFFER PAGE========================================}
      router.get('/product-offer',(req,res)=>{
        productHelpers.getAllProducts().then((product)=>{
          res.render('admin/product-offer',{admin:true,product})
        })
        
      })

      // {========================================GIVE OFFER PAGE=================================================}
     router.get('/give-proOffer/:id',async(req,res)=>{
    let offer = await productHelpers.getProductDetails(req.params.id)
      res.render('admin/give-proOffer',{admin:true,offer})
     })

     router.post('/give-proOffer',(req,res)=>{
      console.log(req.body,'3333333333333333333333333333333333333333333333333333333');

      productHelpers.updateOfferProduct(req.body).then(()=>{
        res.redirect('/admin/product-offer')
      })
     })

    //  {===============================================REMOVE OFFER==================================================}
      router.post('/removeProOffer',(req,res,next)=>{
       
        productHelpers.removeProOffer(req.body).then((response)=>{
          res.json(response)
        })
      })
module.exports = router; 
