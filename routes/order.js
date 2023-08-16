const {Router} = require('express')
const router = Router()
const Order = require('../models/MongoDB/order')

router.get('/', async (req, res) => {
    res.render(
        'order',
        {
            isOrder: true,
            title: 'Заказы'
        }
    )
})

router.post('/', async (req, res) => {
    res.redirect('/order')
})

module.exports = router