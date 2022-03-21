var db = require('../config/connection')
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('../app');
const { ObjectId } = require('mongodb');
var objectId = require('mongodb').ObjectId
const Razorpay = require ('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_rYuFEm4w5PYgIV',
    key_secret: 'C3XrrbUlOpebZ0FXR0y2jF6L',
  });
module.exports = {
    doSignup:(userData)=>{
        return new Promise(async(resolve , reject)=>{
            userData.wallet = parseInt(userData.wallet)
            userData.password = await bcrypt.hash(userData.password,10)

            userData.block = false
            if(userData.referId){
                userData.wallet=100;
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userData.referId)},{
                        $inc:{
                            wallet:100
                        }
                    })
                    resolve(data.insertedId)
                })
            }
            else{

            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
              resolve(data.insertedId)  
            })
            }
        })
        
    },

    doLogin:(userData)=>{
        return new Promise (async(resolve , reject)=>{
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(user.block==false)
                    {
                        if(status){
                            console.log("login sucess");
                            response.user = user
                            response.status= true
                            resolve(response)
                        }else{
                            console.log("login failed");
                            resolve({status:false})
                        }
                    }
                    else
                    {
                        reject({block:true,
                            errMsg:"You have been blocked"})
                    }
                   
                })
            }else{
                console.log("login failed");
                resolve({status:false})
            }
        })
    },

    getAllUsers:()=>{
        return new Promise (async(resolve , reject)=>{
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    }, 
    
    
    mobileCheck:(mob)=>{
        return new Promise (async(resolve , reject)=>{
            let response = {}
            let users = await db.get().collection(collection.USER_COLLECTION).find({phonenumber:mob}).toArray()
            if(users.length!=0){
                response.status=true,
                response.user=users
                resolve(response)
            }else{
                response.status=false,
                resolve(response)
            }
        })
    },

    checkEmail:(data)=>{
        return new Promise (async(resolve , reject)=>{
            let checkMail = await db.get().collection(collection.USER_COLLECTION).findOne({email:data.email})
            if(checkMail)
            {
                resolve({status:true,
                        err:"Email already exist"})
            }
            else{
                let checkMob = await db.get().collection(collection.USER_COLLECTION).findOne({phonenumber:data.phonenumber})
                if(checkMob)
                {
                    resolve({status:true,
                              err:"Mobile number already exist"})
                }
                else{
                    resolve({status:false})
                }
            }
        })     
    },

    // BLOCK USER
    
    blockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:{block:true}
        }).then((status)=>{
            resolve({blockStatus:true})
        }).catch((response)=>{
            console.log(response);

        })
        })
    },

    // UNBLOCK USER 
    
    unblockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:{block:false}
        }).then((status)=>{
            resolve({blockStatus:true})
        }).catch((response)=>{
            console.log(response);
        })
    })
    },

    // ADD TO CART
    addToCart:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise (async(resolve, reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart){
                let proExist = userCart.product.findIndex(prod=> prod.item == proId)
                console.log(proExist,'llllllllllllllllllllllllllllllllllllllll');
                    if(proExist != -1){
                        db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'product.item':objectId(proId)},
                        {
                            $inc:{'product.$.quantity':1}
                        }
                        
                        ).then(()=>{
                            resolve()
                        })
                    }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                {
                   
                    $push :{ product:proObj }
                      
                       
                    
                   
                 }).then((response)=>{
                     resolve()
                 })
                }

            }
            else{
                let cartObj= {
                    user:objectId(userId),
                    product:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },

    // GET PRODUCT IN CART PAGE
    getCartProduct:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                    }
                }
               
            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)
        })
    },

    //  GET CART COUNT
    getCartCount:(userId)=>{
        return new Promise (async(resolve,reject)=>{
            let count=0
            let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count = cart.product.length
            }
            resolve(count)
        })
    },

    changeProductQuantity:(details)=>{
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        console.log(details);
        return new Promise ((resolve,reject)=>{
            if(details.count == -1 && details.quantity ==1){
               db.get().collection(collection.CART_COLLECTION)
               .updateOne({_id:objectId(details.cart)},
                    {
                        $pull:{product:{item:objectId(details.products)}}
                    }
               ).then((response)=>{
                   resolve({removeProduct:true})
               })
               

            }else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart), 'product.item':objectId(details.products)},
            {
                $inc:{'product.$.quantity':details.count}
            }
            
            ).then((response)=>{
                resolve({status:true})
            })  
            }
            
        })
    },

    // REMOVE CART PRODUCT

     removeCartProduct:(details)=>{
        
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
            {
                $pull:{product:{item:objectId(details.products)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
        })
    },

    // GET TOTAL AMOUNT

    getTotalAmount:(userId,id)=>{
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$products.price']}}
                    }
                }
               
            ]).toArray()
            console.log(total);
            resolve(total[0]?.total)
        })
    },
   placeOrder:(order,product,total,delAddress)=>{
       console.log(order,'00000000000000000');
       if(order.checked)
       {
           wallet=order.checked
       }
       var date = new Date()
       let today = date.toDateString()
       return new Promise((resolve,reject)=>{
       
            // console.log(order,product,total);
            // let status = order['payment-method'] === 'COD'?'placed':'pending'
            let status = 'pending'
            let orderObj ={
                deliveryDetails:delAddress,
                userId:objectId(order.userId),
                paymentMethod:order['payment-method'], 
                product:product,
                totalAmount:total, 
                status:status,
                date:new Date()
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{

                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(order.userId) }, {
                    $unset: { couponamount: "" }
                })
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)}) 
                if(order.checked){
                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(order. userID)},{
                        $inc:{
                            wallet:-100
                        }
                    })
                }
                resolve(response.insertedId)
            })
            

       })
        
   },
   getCartProductList:(userId)=>{
       return new Promise(async(resolve,reject)=>{
           let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        //    console.log(cart);
           resolve(cart?.product)
       })
   },
    // GET USER ORDERS
   getUserOrders:(userId)=>{
       return new Promise(async(resolve,reject)=>{  
           
        let orders = await db.get().collection(collection.ORDER_COLLECTION)
        .find({userId:objectId(userId)}).toArray()
        // console.log(orders); 
        resolve(orders)
       })
   }, 

        // GET ORDER PRODUCTS

        getOrderProduct:(orderId)=>{
            return new Promise(async(resolve,reject)=>{
                let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(orderId)}
                    },
                    {
                        $unwind:'$product'
                    },
                    {
                        $project:{
                            item:'$product.item',
                            quantity:'$product.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'products'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                        }
                    }
                   
                ]).toArray()
                // console.log(orderItems);
                resolve(orderItems)
            })
        },

        getUserDetails:(userId)=>{
            return new Promise((resolve,reject)=>{
                user = db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
                resolve(user)
            })

        },

        updateProfile:(user,userId)=>{
            return new Promise ((resolve , reject)=>{
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
                {$set:{
                    name:user.name,
                    email:user.email,
                    phonenumber:user.phonenumber
                }},{upsert:true}
                ).then((response)=>{
                    resolve()
                })
            })
        },

        //CHECK PASSWORD FOR CHANGING
        changePassword:(userPassword,userId)=>{
            return new Promise (async(resolve,reject)=>{
                let response = {}
                let pass = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
                if(pass){
                    bcrypt.compare(userPassword.password,pass.password).then((status)=>{
                        if(status){
                            console.log("password match");
                            response.status= true
                            resolve(response)
                        }
                        else{
                            console.log("password doesnt match");
                            resolve({status:false,passMsg:"password doesnt match"})
                        }
                    })
                }
                else{
                    onsole.log("password doesnt match");
                            resolve({status:false})
                }

            })
        },

        //  POST CONFIRM PASSWORD

        confirmPassword:(newPassword,userId)=>{
            return new Promise (async(resolve,reject)=>{
                newPassword.password = await bcrypt.hash(newPassword.password,10)
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
                {$set:{
                    password:newPassword.password
                }}).then((response)=>{
                    resolve()
                })
            })
        },


            // GENERATE RAZORPAY
        generateRazorpay:(orderId,total)=>{
            return new Promise ((resolve,reject)=>{
                var options = {
                    amount: total*100,
                    currency:"INR",
                    receipt:""+orderId
                };
                instance.orders.create(options, function(err, order){
                    console.log(order,'55555555555555555555555555555555555555555555555555555555555');
                    resolve(order)
                })
            })
        },

        verifyPayment:(details)=>{
            return new Promise ((resolve,reject)=>{
                const crypto=require('crypto');
                let hmac = crypto.createHmac('sha256','C3XrrbUlOpebZ0FXR0y2jF6L')

                hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
                hmac = hmac.digest('hex')
                if(hmac == details['payment[razorpay_signature]']){
                    resolve()
                }else{
                    reject()
                }
            })
        },

        changePaymentStatus:(orderId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({id:objectId(orderId)},
                {
                    $set:{status:'Shipped'}
            }).then(()=>{
                resolve()
            })
            })
        },

        getAllUsersCount: () => {
            return new Promise(async (resolve, reject) => {
                let userCount = await db.get().collection(collection.USER_COLLECTION).estimatedDocumentCount();
                console.log(userCount, 'sssssssssssss');
                resolve(userCount)
            })
        },

        addToWishlist:(proId,userId)=>{
            let proObj={
                item:objectId(proId),
                quantity:1,
                add:true
            }
            return new Promise (async(resolve, reject)=>{
                let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
                if(userWishlist){
                    let proExist = userWishlist.product.findIndex(prod=> prod.item == proId)
                console.log(proExist);
                    if(proExist != -1){
                        resolve({ exist: true })
                    }
                   
                    else{
                        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},
                        {
                            $push :{ product:proObj }
    
                         }).then((response)=>{
                             
                             resolve({status:true})
                         })
                    }
                   
                    
    
                }
                else{
                    let wishlistObj= {
                        user:objectId(userId),
                        product:[proObj]
                    }
                    db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response)=>{
                        resolve({status:true})
                    })
                }
            })
        },

        getWishlistProduct:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                let wishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                    {
                        $match:{user:objectId(userId)}
                    },
                    {
                        $unwind:'$product'
                    },
                    {
                        $project:{
                            item:'$product.item',
                            
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'products'
                        }
                    },
                    {
                        $project:{
                            item:1,products:{$arrayElemAt:['$products',0]}
                        }
                    }
                   
                ]).toArray()
                
                resolve(wishlistItems)
            })
        },
         //  GET WISHLIST COUNT
    getWishlistCount:(userId)=>{
        return new Promise (async(resolve,reject)=>{
            let count=0
            let cart= await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count = cart.product.length
            }
            resolve(count)
        })
    },

        //REMOVE WISHLIST
        removeWishlistProduct:(details)=>{
            console.log(details,'555555555555555555555555555555555555');
          
           return new Promise ((resolve,reject)=>{
               
               db.get().collection(collection.WISHLIST_COLLECTION).updateOne({_id:objectId(details.wishlist)},
               {
                   $pull:{product:{item:objectId(details.products)}}
               }
               ).then((response)=>{
                   console.log(response)
                 
                   resolve({removeProduct:true})
               })
           })
       },

       getUserWallet: (userId) => {
        return new Promise((resolve, reject) => {
            let user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((user) => {
                // console.log(user, '11111111111111111111111');
                resolve(user)
            })
        })
    },

    getPriceFilter:(val1,val2)=>{
        return new Promise(async(resolve,reject)=>{
          let pro=await db.get().collection(collection.PRODUCT_COLLECTION).find({price:{$gt:val1,$lt:val2}}).toArray()
          console.log(pro);
          resolve(pro)
        })
      },
   


}