const { Router } = require('express')
// const Card = require('../models/JSON/card')
// const Course = require('../models/JSON/course')
const Course = require('../models/MongoDB/course')
const router = Router()

function mapCardItem(card) {
    return card.items.map(c => ({
        ...c.courseId._doc,
        id: c.courseId.id,
        count: c.count
    }))
}

function computePrice(courses) {
    return courses.reduce((total, c) => {
        return total += c.price * c.count
    }, 0)
}

router.post('/add', async (req, res) => {
    const course = await Course.findById(req.body.id).lean()
    await req.user.addToCard(course)
    // await Card.add(course)
    res.redirect('/card')
})

router.get('/', async (req, res) => {
    // const card = await Card.fetch()
    const user = await req.user.populate('card.items.courseId')
    const courses = mapCardItem(user.card)
    res.render(
        'card',
        {
            title: 'Корзина',
            isCard: true,
            courses: courses,
            price: computePrice(courses)
        }
    )
    // res.json({test: true})
})

router.delete('/remove/:id', async (req, res) => {
    // const card = await Card.remove(req.params.id)
    await req.user.removeCardItem(req.params.id)
    const user = await req.user.populate('card.items.courseId')
    const courses = mapCardItem(user.card)
    const card = {
        courses,
        price: computePrice(courses)
    }
    res.status(200).json(card)
})

module.exports = router