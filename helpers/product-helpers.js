var db = require('../config/connection')
var collection = require('../config/collections');
const { Collection } = require('mongodb');
var objectId = require('mongodb').ObjectId
module.exports ={
    

    addProduct:(product,callback)=>{
        product.price = parseInt(product.price)
       product.quantity = parseInt(product.quantity)
        console.log(product);
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data);
            callback(data.insertedId)
        })

    },
    getAllProductsHome:()=>{
        return new Promise (async(resolve , reject)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({offer:{$exists:false}}).sort({_id:-1}).limit(8).toArray()
           
        
            resolve(product)
        })
    }, 

    getAllProducts:()=>{
        return new Promise (async(resolve , reject)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({_id:-1}).toArray()
           
        
            resolve(product)
        })
    },
    
    deleteProduct:(proId)=>{
        return new Promise ((resolve,reject)=>{
            
            
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                
                resolve(response)
            }) 
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
              console.log(product,"999999999999999");
                resolve(product)

            })
        })
    },

    updateProduct:(proId,proDetails)=>{
        proDetails.price = parseInt(proDetails.price)
        console.log(proDetails);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    brandName:proDetails.brandName,
                    description:proDetails.description,
                    price:proDetails.price,
                    ram:proDetails.ram,
                    storage:proDetails.storage,
                    battery:proDetails.battery,
                    category:proDetails.category
                }
            }).then((response)=>{ 
               
                 resolve()   
            })
        })
    },

    getOrderDetails:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders =await db.get().collection(collection.ORDER_COLLECTION).find()
            .toArray()
            resolve(orders)

        })
    },

    changeStatus:(status,id)=>{
        let newStatus=status
        return new Promise(async(resolve , reject)=>{
            if(newStatus=='cancel'){
                await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(id)},
                {$set:{
                    status:false,
                    shippingStatus:false,
                    cancelStatus:true
                }},{upsert:true}
                ).then(()=>{
                    
                    resolve()
                })
            }
            else if(newStatus == 'shipped'){
                await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(id)},
                {$set:{
                    status:false,
                    shippingStatus:true
                }},{upsert:true}
                ).then(()=>{
                    
                    resolve()
                })
            }


            else if(newStatus == 'delivered'){
                await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(id)},
                {$set:{
                    status:false,
                    shippingStatus:false,

                    deliveryStatus:true
                }},{upsert:true}
                ).then(()=>{
                    
                    resolve()
                })
            }
         
        })

    },

     getAllProductsCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalProduct=await db.get().collection(collection.PRODUCT_COLLECTION).find().count()
            // console.log(totalProduct);
            resolve(totalProduct)
        })
    },

    getProDetails:()=>{
        return new Promise (async(resolve , reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    getOneProduct:(proId)=>{
        return new Promise(async(resolve,reject)=>{

            let product = db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
            console.log(product,'gggggggggggggggggggggggggggggggg');
                resolve(product)
        })
    },

    updateOfferProduct:(offer)=>{
        // console.log(offer.productId,"pppppppppppp");
        // console.log(offer.offerPrice,"pppppppppppp");
        let newPrice = parseInt(offer.price)
        let offerPrice = parseInt(offer.offerPrice)
        let total= newPrice-offerPrice
        // console.log(total,'676767676767667676767676767676');
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(offer.productId)},{
                $set:{
                    offer:offerPrice,
                    price:total,
                    oldPrice:newPrice
                }
            },{upsert:true}
            ).then(()=>{
                resolve()
            })
        })
    },

   removeProOffer:(proId)=>{
    let offerPrice = parseInt(proId.off)
    let newPrice = parseInt(proId.pri)
    let total = newPrice+offerPrice
       
        return new Promise ((resolve,reject)=>{
           db.get().collection(collection.PRODUCT_COLLECTION).updateMany({_id:objectId(proId.id)},
           [{$unset:["offer","oldPrice"]},
           {$set:{price:total}}]
           ).then((response)=>{
               resolve({removeProOffer:true})
           })
          
        })
    },


    // removeProOffer:(proId)=>{
    //     console.log(proId,'88888888888888888888888888888888888888888');
       
    //     return new Promise ((resolve,reject)=>{
    //        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId.id)},
    //        {$unset:{
    //         offer:" "
    //        }
    //     }
           
    //        ).then((response)=>{
    //            resolve({removeProOffer:true})
    //        })
          
    //     })
    // },
    getOfferProduct:()=>{
        return new Promise (async(resolve , reject)=>{
            let offerProduct = await db.get().collection(collection.PRODUCT_COLLECTION).find({offer:{$exists:true}}).sort({_id:-1}).limit(8).toArray()
           let oldPrice=offerProduct.price+offerProduct.offer
           console.log(oldPrice);
            
            resolve(offerProduct)
        })
    },


}