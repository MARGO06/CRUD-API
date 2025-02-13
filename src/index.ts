import http from 'node:http'
import db from './db.json'

enum Method {
  Get = 'GET',
  Post = 'POST',
  Delete = 'DELETE',
  Put = 'PUT',
}
let userIdCounter = db.users.length + 1

const requestsGet = (userId: string | null, req: http.IncomingMessage, res: http.ServerResponse) => {
  if (req.url) {
    if (req.url === '/users') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(db.users))
      return
    }

    if (userId) {
      if (req.url === `/users?id=${userId}`) {
        const id = db.users.find((item) => item.id === userId)
        if (userId === '') {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Invalid user ID format. Must be a non-empty string.' }))
          return
        }
        if (id) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(id))
          return
        }
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'User does not exist' }))
        return
      }
    }
  }
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'URL does not exist' }))
}

const requestsPost = (req: http.IncomingMessage, res: http.ServerResponse) => {
  if (req.url && req.url === '/users') {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      const newUser = JSON.parse(body)

      if (!newUser.username || !newUser.age) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Username and age are required.' }))
        return
      }
      if (newUser.username && newUser.age) {
        const user = {
          id: String(userIdCounter++),
          username: newUser.username,
          age: newUser.age,
          hobbies: newUser.hobbies || [],
        }

        db.users.push(user)

        res.writeHead(201, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(user))
        return
      }
    })
  }
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'URL does not exist' }))
}

const server = http.createServer((req, res) => {
  const url = new URL(`https://localhost:3000/${req.url}`)
  const userId = url.searchParams.get('id')
  const method = req.method
  if (method === Method.Get) {
    requestsGet(userId, req, res)
  } else if (method === Method.Post) {
    requestsPost(req, res)
  }
})

server.listen(3000)
