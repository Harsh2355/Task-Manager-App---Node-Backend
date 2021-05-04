const app = require('../src/app.js') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
const Task = require('../src/models/task')
const { userOneId, user1, setupDatabase, tasks1, user2 , tasks2, tasks3} = require('./fixtures/db')

beforeEach(setupDatabase)


test('should create task for user', async () => {
    const res = await request.post('/tasks')
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send({
                                 description: 'Go the Grocery store',
                                 completed: 'false'
                             })

    expect(res.status).toBe(201)
    const task = await Task.findById(res.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should not create task with invalid description/completed', async () => {
    const res = await request.post('/tasks')
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send({
                                 description: 6947632,
                                 completed: 'hello'
                             })

    expect(res.status).toBe(400)
    expect(res.body._id).toBe(undefined)
})

test('should get all the tasks of logged in user', async () => {
    const res = await request.get('/tasks')
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send()
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
})

test('should get all the completed tasks of logged in user', async () => {
    const res = await request.get('/tasks?completed=true')
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send()
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].completed).toEqual(true)
})

test('Should delete user task', async () => {
    const res = await request.delete(`/tasks/${tasks1._id}`)
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send()
    expect(res.status).toBe(200)
    const task = await Task.findById(res.body._id)
    expect(task).toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
    const res = await request.delete(`/tasks/${tasks1._id}`)
                             .send()
    expect(res.status).toBe(401)
    // no need to check further as it gives authentication error
})

test('user2 should not be able to delete task1', async () => {
    const res = await request.delete(`/tasks`)
                             .query({id: tasks1._id})
                             .set('Authorization', `Bearer ${user2.tokens[0].token}`)
                             .send()
    expect(res.status).toBe(404)
    const task = await Task.findById(tasks1._id)
    expect(task).not.toBeNull()
})

test('update a task of authenticated user', async () => {
    const res = await request.patch(`/tasks/${tasks1._id}`)
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send({
                                 description: "updated tasks 1"
                             })
    expect(res.status).toBe(200)
    const task = await Task.findById(tasks1._id)
    expect(task.description).toBe("updated tasks 1")
})

test('Should not update other users task', async () => {
    const res = await request.patch(`/tasks/${tasks3._id}`)
                             .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                             .send({
                                 description: "updated tasks 3"
                             })
    expect(res.status).toBe(404)
    const task = await Task.findById(tasks3._id)
    expect(task.description).toBe('Third Task')
})