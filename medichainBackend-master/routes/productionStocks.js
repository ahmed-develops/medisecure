const express = require('express');
const router = express.Router();
const Medicines = require("../models/Medicines").Medicines;
const ProductionStock = require('../models/ProductionStocks').ProductionStocks;
// const multichain = require("../config/multichain");

//protected route
router.get('/getAll', (req, res) => {
    try {
        const stock = ProductionStock.find()
            .populate("production", "-password -token")
            .populate("medicine");
        stock.then((allProductionStock) => {
            res.send({ result: allProductionStock })
        }).catch(e => {
            res.send({ message: e.message });
        })
    } catch (e) {
        res.send({ message: "invalid request" });
    }
})

router.get('/getStockById/:id', (req, res) => {
    var id = req.params.id
    const stock = ProductionStock.findOne({ id }).populate("production", "-password -token");
    stock.then((allProductionStock) => {
        res.send({ result: allProductionStock })
    }).catch(e => {
        res.send({ message: e.message });
    })
})
router.get('/getStocksByProduction/:id', (req, res) => {
    var id = req.params.id
    const stock = ProductionStock.find({ production: id })
        .populate("medicine");
    stock.then((allProductionStock) => {
        res.send({ data: allProductionStock })
    }).catch(e => {
        res.send({ message: e.message, error: true });
    })
})

router.post('/add', (req, res) => {
    const data = req.body;
    console.log(data, 'data');
    // const medicine = Medicines.findOne({ id: data.medicine });
    // console.log(medicine, 'medicine');
    const stock = new ProductionStock(data);
    // medicine.then((med) => {
        // multichain.getAddresses((err, addresses) => {
        //     multichain.createMultiSig({ nrequired: 2, keys: addresses }, (err, wallet) => {
        //         console.log(wallet, "wallet")
        //         var address = wallet.address;
        //         multichain.issue({ address, asset: med.name, qty: stock.units, units: 1, details: stock },
        // (err, response) => {
        //     console.log(response, err, "res and err");
        //     res.send({ message: "done" });
            stock.save()
                .then((s) => {
                    res.send({ message: "Stocks added successfully with stock id: " + s.id })
                })
                .catch(e => {
                    res.send({ message: e.message, error: true })
                })
        // }
        //             )
        //     })
        // })
    // })

});

router.put('/update', (req, res) => {
    const data = req.body;
    if (data.id) {
        const stock = ProductionStock.findOne({ id: data.id }).update(data);
        stock
            .then(() => {
                res.send({ message: "Medicine updated successfully!" })
            })
            .catch(e => {
                console.log('e ===>', e);
                res.send({ message: e.message })
            })
    } else {
        res.send({ message: "Id is not present for the entity" })
    }
})

module.exports = router;