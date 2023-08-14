const {Router} = require('express')
const Courses = require('../models/course')
const router = Router()

router.get('/', async (req, res) => {
    const courses = await Courses.getAll()
    res.render(
        'courses',
        {
            title: 'Курсы',
            isCourses: true,
            courses
        }
    )
})

module.exports = router