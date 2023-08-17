const {Router} = require('express')
// const Course = require('../models/JSON/course')
const Course = require('../models/MongoDB/course')
const auth = require('../middleware/auth')
const router = Router()

router.get('/', async (req, res) => {
    // const courses = await Course.getAll()
    const courses = await Course.find().lean().populate('userId', 'email name').select('title price urlImg')
    res.render(
        'courses',
        {
            title: 'Курсы',
            isCourses: true,
            courses
        }
    )
})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    // const course = await Course.getById(req.params.id)
    const course = await Course.findById(req.params.id).lean()
    res.render(
        'edit',
        {
            title: `Редактировать ${course.title}`,
            course
        }
    )
})

router.post('/edit', auth, async (req, res) => {
    // await Course.update(req.body)
    const {id} = req.body
    delete req.body.id
    await Course.findByIdAndUpdate(id, req.body)
    res.redirect('/courses')
})

router.get('/:id', async (req, res) => {
    // const course = await Course.getById(req.params.id)
    const course = await Course.findById(req.params.id).lean()
    res.render(
        'course',
        {
            layout: 'empty',
            title: `Курс ${course.title}`,
            course
        }
    )
})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({_id: req.body.id})
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }

})

module.exports = router