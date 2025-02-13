import http from 'node:http'
import db from './db.json'

enum Method {
  Get = 'GET',
  Post = 'Post',
  Delete = 'Delete',
  Put = 'Put',
}
const requestsGet = (
  userId: string | null,
  method: string | undefined,
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  if (method === Method.Get && req.url) {
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
const server = http.createServer((req, res) => {
  const url = new URL(`https://localhost:300/${req.url}`)
  const userId = url.searchParams.get('id')
  const method = req.method

  requestsGet(userId, method, req, res)
})

server.listen(3000)
