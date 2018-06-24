const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dev = process.env.NODE_ENV !== 'production'
const next = require('next')

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  server.use(cors())
  server.use(bodyParser.json())

  server.get('*', (req, res) => {
    return handle(req, res)
  })
  server.listen(3000, err => {
    if (err) throw err
    console.log('Server ready on http://localhost:3000')
  })
})
