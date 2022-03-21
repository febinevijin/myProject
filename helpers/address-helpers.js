var db = require('../config/connection')
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectId
module.exports ={


            // ADD ADDRESS

            addAddresss:(address)=>{
        address.userId= objectId(address.userId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address).then((data)=>{
                resolve(data)
            })
        })
    },

    getAllAddress:(user)=>{
        let userId = objectId(user._id)
        return new Promise(async(resolve,reject)=>{
            let address =await db.get().collection(collection.ADDRESS_COLLECTION).find({userId:userId}).toArray()
            // console.log(address,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
            resolve(address)

        })
    },

    getdelAddress:(orderId)=>{
        
        return new Promise(async(resolve,reject)=>{
            let address =await db.get().collection(collection.ADDRESS_COLLECTION).findOne({_id:objectId(orderId)})
            // console.log(address,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
            resolve(address)

        })
    },

    getOneAddress:(userId)=>{

        return new Promise(async(resolve,reject)=>{

            let address =await db.get().collection(collection.ADDRESS_COLLECTION).findOne({_id:objectId(userId)})
            resolve(address)
        })
    },

    updateAddress:(upAddresss)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).updateOne({_id:objectId(upAddresss.addressId)},
                {$set:{
                    name:upAddresss.name,
                    email:upAddresss.email,
                    mobile:upAddresss.mobile,
                    address:upAddresss.address,
                    city:upAddresss.city,
                    pincode:upAddresss.pincode
                    
                }}
                ).then((response)=>{
                    resolve()
                })
        })
    }

}