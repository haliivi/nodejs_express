const {Router} = require('express')
// const Course = require('../models/JSON/course')
const {validationResult} = require('express-validator')
const Course = require('../models/MongoDB/course')
const auth = require('../middleware/auth')
const {courseValidators} = require('../utils/validators')
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

router.post('/', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render(
            'add',
            {
                title: 'Добавление курса',
                isAdd: true,
                error: errors.array()[0].msg,
                data: {
                    title: req.body.title,
                    price: req.body.price,
                    urlImg: req.body.urlImg,
                }
            }
        )
    }
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