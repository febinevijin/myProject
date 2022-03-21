var db = require('../config/connection')
var collection = require('../config/collections');
const async = require('hbs/lib/async');
const res = require('express/lib/response');
var objectId = require('mongodb').ObjectId

module.exports = {

    getsalesReport: () => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { deliveryStatus: true }
                },
                {
                    $project: {
                        orderId: '$orderId',
                        userId: '$userId',
                        paymentMethod: '$paymentMethod',
                        totalAmount: '$totalAmount',
                        date: '$date',
                        product: '$product'
                    }
                },
            ]).toArray()
            resolve(orderItems)
        })
    },

    getweeklyreport: async () => {
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{ status: { $ne: 'cancelled' } }, { status: { $ne: 'pending' } }],
                        date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                { $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } } },
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let salesOfLastWeekData = []
            for (let i = 0; i < 8; i++) {
                let count = data.find((d) => d._id === thisday + i - 7)

                if (count) {
                    salesOfLastWeekData.push(count.count)
                } else {
                    salesOfLastWeekData.push(0)
                }
            }
            // console.log(salesOfLastWeekData);
            resolve(salesOfLastWeekData)

        })
    },

    getSalesReport: (from, to) => {
        console.log(new Date(from), 'from date ');
        console.log(new Date(to), 'to date');

        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [
                            { date: { $gte: new Date(from), $lte: new Date(to) } }, { deliveryStatus: true }]
                    }
                },
            ]).toArray()
            // console.log(orders, 'daily orders');
            resolve(orders)
        })
    },


    getNewSalesReport: (type) => {
        const numberOfDays = type === 'daily' ? 1 : type === 'weekly' ? 7 : type === 'monthly' ? 30 : type === 'yearly' ? 365 : 0
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{
                            date: { $gte: new Date(new Date() - numberOfDays * 60 * 60 * 24 * 1000) }
                        }, { deliveryStatus: true }]
                    },
                },
            ]).toArray()
            // console.log(data, '111111111111');
            resolve(data)

        })
    },

    getTotalProfit: () => {
        return new Promise(async (resolve, reject) => {
            let profit = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match
                        : { deliveryStatus: true }
                },
                {
                    $group: {
                        _id: 0,
                        profit: {
                            $sum: '$totalAmount'
                        }
                    }
                }
            ]).toArray()
            // console.log(profit,'111111');
            resolve(profit[0]?.profit)
        })
    },
    TotalOrderCount: () => {
        return new Promise(async (resolve, reject) => {
            let totalOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ deliveryStatus: true }).count()
            // console.log(totalOrders,'11111');
            resolve(totalOrders)
        })
    },


    getrazroPayTotal: () => {
        return new Promise(async (resolve, reject) => {
            let razorPayTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{ deliveryStatus: true }, { paymentMethod: 'ONLINE' }]
                    }
                }, {
                    $group: {
                        _id: 0,
                        profit: {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $set: { status: 'Razorpay' }
                }
            ]).toArray()
            console.log(razorPayTotal);
            resolve(razorPayTotal);
        })
    },
    getCodTotal:()=>{
        return new Promise(async (resolve, reject) => {
            let codTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{ deliveryStatus: true }, { paymentMethod: 'COD' }]
                    }
                }, {
                    $group: {
                        _id: 0,
                        profit: {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $set: { status: 'COD' }
                }
            ]).toArray()
            console.log(codTotal);
            resolve(codTotal);
        })
    },
    getPaypalTotal:()=>{
        return new Promise(async (resolve, reject) => {
            let payPalTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{ deliveryStatus: true }, { paymentMethod: 'PAYPAL' }]
                    }
                }, {
                    $group: {
                        _id: 0,
                        profit: {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $set: { status: 'PAYPAL' }
                }
            ]).toArray()
            console.log(payPalTotal);
            resolve(payPalTotal);
        })
    }

}