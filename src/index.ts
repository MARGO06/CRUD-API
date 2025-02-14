import http from 'node:http'
import db from './db.json'
import dotenv from 'dotenv'

dotenv.config()
const PORT = process.env.PORT

enum Method {
  Get = 'GET',
  Post = 'POST',
  Delete = 'DELETE',
  Put = 'PUT',
}

let userIdCounter = db.users.length + 1

const inValidID = (res: http.ServerResponse) => {
  res.writeHead(400, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Invalid user ID format. Must be a non-empty string.' }))
  return
}

const userIdNotFound = (res: http.ServerResponse) => {
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'User does not exist' }))
  return
}

const urlIdNotFound = (res: http.ServerResponse) => {
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'URL does not exist' }))
}

const requestsGet = (userId: string | null, req: http.IncomingMessage, res: http.ServerResponse) => {
  /*throw new Error('Simulated error in GET request')*/
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
          inValidID(res)
        }
        if (id) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(id))
          return
        }
        userIdNotFound(res)
      }
    }
  }
  urlIdNotFound(res)
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
  urlIdNotFound(res)
}

const requestsPut = (userId: string | null, req: http.IncomingMessage, res: http.ServerResponse) => {
  if (req.url && req.url === `/users?id=${userId}`) {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      const indexUser = db.users.findIndex((item) => item.id === userId)
      const newUser = JSON.parse(body)
      if (userId === '') {
        inValidID(res)
      }

      if (indexUser > -1) {
        db.users[indexUser] = {
          ...db.users[indexUser],
          ...newUser,
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(db.users[indexUser]))
        return
      }
      userIdNotFound(res)
    })
  } else {
    urlIdNotFound(res)
  }
}

const requestsDelete = (userId: string | null, req: http.IncomingMessage, res: http.ServerResponse) => {
  if (req.url && req.url === `/users?id=${userId}`) {
    const indexUser = db.users.findIndex((item) => item.id === userId)

    if (userId === '') {
      inValidID(res)
    }

    if (indexUser > -1) {
      db.users.splice(indexUser, 1)
      res.writeHead(204)
      res.end()
      return
    }
    userIdNotFound(res)
  }
  urlIdNotFound(res)
}

const server = http.createServer((req, res) => {
  const url = new URL(`https://localhost:3000/${req.url}`)
  const userId = url.searchParams.get('id')
  const method = req.method
  try {
    switch (method) {
      case Method.Get:
        requestsGet(userId, req, res)
        break
      case Method.Put:
        requestsPut(userId, req, res)
        break
      case Method.Post:
        requestsPost(req, res)
        break
      case Method.Delete:
        requestsDelete(userId, req, res)
        break
      default:
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Method Not Allowed' }))
        break
    }
  } catch (error) {
    const err = error as unknown as Error
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err.message }))
  }
})

server.listen(PORT)
