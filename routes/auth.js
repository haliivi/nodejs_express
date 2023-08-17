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
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            const areSame = password === candidate.password
            if (areSame) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(e => {
                    if (e) throw e
                })
                res.redirect('/')
            } else {
                res.redirect('/auth/login#login')
            }
        } else {
            res.redirect('/auth/login#login')
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', async (req, res) => {
    try {
        const {email, password, repeat, name} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            res.redirect('/auth/login#register')
        } else {
            const user = new User({email, name, password, card: {items: []}})
            await user.save()
            res.redirect('/auth/login#login')
        }
    } catch (e) {
        console.log(e)
    }
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

module.exports = router