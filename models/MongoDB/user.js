const {Schema, model} = require('mongoose')

const user = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        required: true
    },
    card: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true,
                }
            }
        ]
    }
})

user.methods.addToCard = function (course) {
    const items = [...this.card.items]
    const idx = items.findIndex(c => {
        return c.courseId.toString() === course._id.toString()
    })
    if (idx >= 0) {
        items[idx].count++
    } else {
        items.push({
            courseId: course._id,
        })
    }
    this.card = {items}
    return this.save()
}

user.methods.removeCardItem = function (id) {
    let items = [...this.card.items]
    const idx = items.findIndex(c => c.courseId.toString() === id.toString())
    if (items[idx].count === 1) {
        items = items.filter(c => c.courseId.toString() !== id.toString())
    } else {
        items[idx].count--
    }
    this.card = {items}
    return this.save()
}

user.methods.clearCard = function () {
    this.card = {items: []}
    return this.save()
}

module.exports = model('User', user)