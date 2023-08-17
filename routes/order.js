const {Router} = require('express')
const router = Router()
const Order = require('../models/MongoDB/order')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({'user.userId': req.user._id}).populate('user.userId').lean()
        res.render(
            'order',
            {
                isOrder: true,
                title: 'Заказы',
                orders: orders.map(o => {
                    return {
                        ...o,
                        price: o.courses.reduce((total, c) => total + c.count * c.course.price, 0)
                    }
                })
            }
        )
    } catch (e) {
        console.log(e)
    }
})

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user.populate('card.items.courseId')
        const courses = user.card.items.map(c => ({
            count: c.count,
            course: {...c.courseId._doc}
        }))
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses
        })
        await order.save()
        await req.user.clearCard()
        res.redirect('/order')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router