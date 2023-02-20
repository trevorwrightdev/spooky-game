const express = require('express')
const app = express()
const cors = require('cors')
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")

var whitelist = [
    'http://localhost:3000',
]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}

app.use(cors(corsOptions))

const io = new Server(server, { cors: corsOptions })

io.on('connection', (socket) => {
    
})

server.listen(process.env.PORT || 4200, () => {
    console.log('Booted.')
})