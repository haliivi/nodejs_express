const dotenv = require('dotenv')
const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const csurf = require('csurf')
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cardRoutes = require('./routes/card')
const orderRoutes = require('./routes/order')
const authRoutes = require('./routes/auth')
const mongoose = require('mongoose')
const User = require('./models/MongoDB/user')
const varsMiddleware = require('./middleware/vars')
const userMiddleware = require('./middleware/user')

dotenv.config()

const uriMongoDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_NAME}.she4wsi.mongodb.net/shop`

const app = express()

const store = new MongoStore({
    collection: 'sessions',
    uri: uriMongoDB
})

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', './views')

// app.use(async (req, res, next) => {
//     try {
//         const user = await User.findById('64dc69fd8caf8f1f97932f49')
//         req.user = user
//         next()
//     } catch (e) {
//         console.log(e)
//     }
// })
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: 'some secret value',
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(csurf())
app.use(varsMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/order', orderRoutes)
app.use('/auth', authRoutes)


async function start() {
    const PORT = process.env.PORT || 3000
    try {
        await mongoose.connect(uriMongoDB, {useNewUrlParser: true})
        // const candidate = await User.findOne()
        // if (!candidate) {
        //     const user = new User({
        //         email: 'test@mail.ru',
        //         name: 'Test',
        //         card: {items: []}
        //     })
        //     await user.save()
        // }
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()