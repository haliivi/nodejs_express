const {Router} = require('express')
const {validationResult} = require('express-validator')
const User = require('../models/MongoDB/user')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const registrationMail = require('../emails/registration')
const resetMail = require('../emails/reset')
const {registerValidators, loginValidators} = require('../utils/validators')
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

router.post('/login', loginValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#login')
        }
        const {email} = req.body
        const user = await User.findOne({email})
        req.session.user = user
        req.session.isAuthenticated = true
        req.session.save(e => {if (e) throw e})
        res.redirect('/')
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, password, name} = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }
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
    } catch (e) {
        console.log(e)
    }
})

router.get('/reset', (req, res) => {
    res.render(
        'auth/reset',
        {
            title: 'Забыли пароль?',
            error: req.flash('error')
        }
    )
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (e, buffer) => {
            if (e) {
                req.flash('error', 'Что-то пошло не так, повторите позже.')
                return res.redirect('/auth/reset')
            }
            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})
            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transport.sendMail(resetMail(candidate.email, token))
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'Такого email нет.')
                res.redirect('/auth/reset')
            }
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })
        if (!user) {
            return res.redirect('/auth/login')
        } else {
            res.render(
                'auth/password',
                {
                    title: 'Восстановить доступ',
                    error: req.flash('error'),
                    userId: user._id.toString(),
                    token: req.params.token
                }
            )
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp:{$gt: Date.now()}
        })
        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', 'Время жизни токена истекло')
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router