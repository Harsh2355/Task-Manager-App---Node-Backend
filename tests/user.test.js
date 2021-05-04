const app = require('../src/app.js') 
const supertest = require('supertest')
const request = supertest(app)
const User = require('../src/models/user')
const { userOneId, user1, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('sign up new user', async () => {
    const res = await request.post('/users').send({
        name: "Andrew mead",
        email:"andrew@gmail.com",
        password: "wearesist1",
    })
    expect(res.status).toBe(201)

    //assert that the database was changed correctly
    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()

    // assertions about the response body
    expect(res.body).toMatchObject({
        user : {
            name: 'Andrew mead',
            email: 'andrew@gmail.com',
        },
        token: user.tokens[0].token,
    })

    // assertion about password (is hashed)
    expect(user.password).not.toBe('wearesist1')
})

test('should not signup with invalid email and password', async () => {
    const res = await request.post('/users')
                             .send({
                                 name: "Drew",
                                 email: "drew",   // invalid email
                                 password: "sgh34"    // invalid password
                             })

    expect(res.status).toBe(400)
    expect(res.body.user).toBe(undefined)
})

test('login for existing user', async () => {
    const res = await request.post('/users/login').send({
        email: user1.email,
        password: user1.password,
    })
    expect(res.status).toBe(200)

    // assert that token is res matches users second token
    const user = await User.findById(userOneId)
    expect(res.body.token).toBe(user.tokens[1].token)
})

test('login: non-existing user', async () => {
    const res = await request.post('/users/login').send({
        email: 'jane@gmail.com',
        password: 'bdsbdhjbgjvbs21'
    })
    expect(res.status).toBe(400)
})

test('get profile for user', async () => {
    const res = await request.get('/users/me')
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send()

    expect(res.status).toBe(200)
})

test('get user for unauthenticated user', async () => {
    const res = await request.get('/users/me')
                             .set('Authorization', `Bearer 73294bhdxyg263g`).send()

    expect(res.status).toBe(401)
})

test('deleting account of logged in user', async () => {
    const res = await request.delete('/users/me')
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send()
    expect(res.status).toBe(200)

    // assert user has been deleted from database
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('should not delete account of unauthenticated user', async () => {
    const res = await request.delete('/users/me')
                             .set('Authorization', `Bearer suhufegf37r732riy`)
                             .send()
    expect(res.status).toBe(401)
})

test('should update valid user fields', async () => {
    const res = await request.patch('/users/me')
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send({
                                 name: 'James',
                                 email: 'james@gmail.com'
                             })
    expect(res.status).toBe(200)

    // check data to confirm change
    const user = await User.findById(userOneId)
    expect(user).toMatchObject({
        name: 'James',
        email: 'james@gmail.com'
    })
})

test('should not update invalid user fields', async () => {
    const res = await request.patch('/users/me')
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send({
                                 location: "Georgia"
                             })
    expect(res.status).toBe(404)
})

test('Should not update user if unauthenticated', async () => {
    const res = await request.patch('/users/me')
                             .send({
                                 name: 'James',
                                 email: 'james@gmail.com'
                             })
    expect(res.status).toBe(401)
    // no need to check further as it gives authentication error
})

