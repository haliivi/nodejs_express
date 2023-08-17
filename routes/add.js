const {Router} = require('express')
// const Course = require('../models/JSON/course')
const Course = require('../models/MongoDB/course')
const auth = require('../middleware/auth')
const router = Router()

router.get('/', auth, (req, res) => {
    res.render(
        'add',
        {
            title: 'Добавление курса',
            isAdd: true,
        }
    )
})

router.post('/', auth, async (req, res) => {
    // const course = new Course(req.body)
    const {title, price, urlImg} = req.body
    const course = new Course({
        title: title,
        price: price,
        urlImg: urlImg,
        userId: req.user
    })
    try {
        await course.save()
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router