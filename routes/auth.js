const {Router} = require('express')
const User = require('../models/MongoDB/user')
const router = Router()

router.get('/login', async (req, res) => {
    res.render(
        'auth/login',
        {
            title: 'Авторизация',
            isLogin: true,
        }
    )
})

router.post('/login', async (req, res) => {
    const user = await User.findById('64dc69fd8caf8f1f97932f49')
    req.session.user = user
    req.session.isAuthenticated = true
    req.session.save(e => {
        if (e) throw e
    })
    res.redirect('/')
})

router.post('/register', async (req, res) => {

})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

module.exports = router