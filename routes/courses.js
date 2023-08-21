const {Router} = require('express')
// const Course = require('../models/JSON/course')
const Course = require('../models/MongoDB/course')
const auth = require('../middleware/auth')
const router = Router()
const {courseValidators} = require('../utils/validators')
const {validationResult} = require('express-validator')

function isOwner (course, req) {
    return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
    try {
        // const courses = await Course.getAll()
        const courses = await Course.find().lean().populate('userId', 'email name').select('title price urlImg')
        res.render(
            'courses',
            {
                title: 'Курсы',
                isCourses: true,
                userId: req.user ? req.user._id.toString() : null,
                courses
            }
        )
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    // const course = await Course.getById(req.params.id)
    try {
        const course = await Course.findById(req.params.id).lean()
        if (!isOwner) return res.redirect('/courses')
        res.render(
            'edit',
            {
                title: `Редактировать ${course.title}`,
                course
            }
        )
    } catch (e) {
        console.log(e)
    }
})

router.post('/edit', auth, async (req, res) => {
    // await Course.update(req.body)
    try {
        const {id} = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
        }
        delete req.body.id
        const course = await Course.findById(id)
        if (!isOwner(course, req)) return res.redirect('/courses')
        Object.assign(course, req.body)
        await course.save()
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id', async (req, res) => {
    // const course = await Course.getById(req.params.id)
    try {
        const course = await Course.findById(req.params.id).lean()
        res.render(
            'course',
            {
                layout: 'empty',
                title: `Курс ${course.title}`,
                course
            }
        )
    } catch (e) {
        console.log(e)
    }
})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }

})

module.exports = router