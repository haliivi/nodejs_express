const {Router} = require('express')
const User = require('../models/MongoDB/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const registrationMail = require('../emails/registration')
const router = Router()

const transport = nodemailer.createTransport({
   host: process.env.SENDGRID_HOST,
   port: process.env.SENDGRID_PORT,
   auth: {
       user: process.env.SENDGRID_API_USER,
       pass: process.env.SENDGRID_API_KEY
   }
})

router.get('/login', async (req, res) => {
    res.render(
        'auth/login',
        {
            title: 'Авторизация',
            isLogin: true,
            loginError: req.flash('loginError'),
            registerError: req.flash('registerError')
        }
    )
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)
            if (areSame) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(e => {
                    if (e) throw e
                })
                res.redirect('/')
            } else {
                req.flash('loginError', 'Неверный пароль')
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginError', 'Такого пользователя нет')
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
            req.flash('registerError', 'Пользователь с таким email уже существует')
            res.redirect('/auth/login#register')
        } else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({email, name, password: hashPassword, card: {items: []}})
            await user.save()
            res.redirect('/auth/login#login')
            transport.sendMail(
                registrationMail(email),
                function(error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                }
            )
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