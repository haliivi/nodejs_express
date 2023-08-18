module.exports = function (email) {
    return {
        to: email,
        from: process.env.FROM_MAIL,
        subject: 'Аккаунт создан',
        html: `
            <h1>Добро пожаловать в наш магазин</h1>
            <p>Вы успешно создан аккаунт с email - ${email}</p>
            <hr />
            <a href="${process.env.BASE_URL}">Магазин курсов</a>
        `
    }
}