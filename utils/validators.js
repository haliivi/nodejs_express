const {body} = require('express-validator')
const User = require('../models/MongoDB/user')
const bcrypt = require('bcryptjs')

exports.registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Введите корректный email')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: value})
                if (user) return Promise.reject('Такой email уже занят')
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('password', 'Пароль должен быть минимум 6 символов')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать')
            }
            return true
        })
        .trim(),
    body('name').isLength({min: 3})
        .withMessage('Имя должно быть минимум 3 символа')
        .trim()
]

exports.loginValidators = [
    body('email')
        .custom(async (email, {req}) => {
            const user = await User.findOne({email})
            return !user ? Promise.reject('Пользователя с такой почтой нет') : true
        }),
    body('password')
        .custom(async (password, {req}) => {
            const {email} = req.body
            const user = await User.findOne({email})
            const areSame = await bcrypt.compare(password, user.password)
            return !areSame ? Promise.reject('Неверный пароль') : true
        })
]