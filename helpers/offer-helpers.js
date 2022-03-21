var db = require('../config/connection')
var collection = require('../config/collections');
const async = require('hbs/lib/async');
const res = require('express/lib/response');
var objectId = require('mongodb').ObjectId

module.exports = {

    addCoupon:(offer)=>{
        console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
        offer.discount = parseInt(offer.discount)
        offer.used=false
        return new Promise((resolve,reject)=>{
         
            db.get().collection(collection.COUPON_COLLECTION)
            .insertOne(offer).then(()=>{
                resolve()
            })
        })
    },

    getAllCoupon:()=>{
        return new Promise (async(resolve,reject)=>{
            let coupon = await db.get().collection(collection.COUPON_COLLECTION)
            .find().toArray()
            resolve(coupon)
        })
    },

            //DELETE COUPON

        deleteCoupon:(body)=>{
            return new Promise ((resolve,reject)=>{
                db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(body.coupon)})
                .then((response)=>{
                    resolve(response)
                })
                
            })
        },

        getUserCoupon:()=>{
            return new Promise(async(resolve,reject)=>{
                let coupon = await db.get().collection(collection.COUPON_COLLECTION)
                .find().toArray()
                resolve(coupon)
            })
        },

      //  GET DISCOUNT
      checkCoupon: (AppliedCoupon, UserID) => {
        //    console.log("reached check coupon router");
            // console.log(AppliedCoupon);
            let Coupon=AppliedCoupon
            console.log(Coupon,'1111111111111111');
            var UseriD = {
                userID: UserID
            }
            // console.log(UseriD);
            return new Promise(async (resolve, reject) => {
                // console.log("reached prmise");
                Couponapplied = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(UserID) })
                // console.log(Couponapplied,'2222222222222');
                // console.log(Couponapplied.couponamount,'1111111111');
                if (Couponapplied.couponamount) {
                    resolve({ OneCouponUsed: true })
                } else {
                    CouponOffer = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon:Coupon})
                    // console.log(CouponOffer,'1111111111111');
                    if (CouponOffer) {
                        // console.log("ffffffffffffffff", CouponOffer.users);
                        if (CouponOffer.users) {
                            var CoupenExist = CouponOffer.users.findIndex(users => users.userID == UserID)
                            // console.log("find index checked");
                            console.log(CoupenExist);
                            // console.log('CouponOffer', CouponOffer);
                            if (CoupenExist != -1) {
                                // console.log("CouponOffer.users user undeeeee reject aaaayyeeeee");
                                resolve({ CoupenUsed: true })
                            }else{
                                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(UserID)}, { $set: {couponamount: CouponOffer.discount}})
    
                                await db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id:CouponOffer._id }, { $push:{users: UseriD}}).then((response) => {
                                    // console.log("fgfgfgfgfgfgfgfggfgffgfgfg");
                                    CoupDiscount = CouponOffer.discount
                                    resolve({ Coupon: true, CoupDiscount })
                                })
                            }
                        }
                        else {
                            // console.log("  f CouponOffer.users   user illleeeeee  aaaayyeeeee");
                            // console.log(Coupon);
                            // console.log("UserID", UserID);
                            // console.log('Coupon.coupondicount', CouponOffer.price);
                            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(UserID)}, { $set: {couponamount: CouponOffer.discount}})
    
                            await db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id:CouponOffer._id }, { $push:{users: UseriD}}).then((response) => {
                                // console.log("fgfgfgfgfgfgfgfggfgffgfgfg");
                                CoupDiscount = CouponOffer.discount
                                resolve({ Coupon: true, CoupDiscount })
                            })
                        }
                    } else {
                        resolve({ NoCoupon: true })
                    }
                }
            })
        },

}