require('dotenv').config()

const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const usersRouter = require('./controllers/users')
const notesRouter = require('./controllers/notes')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connectiong to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
	.then(result => {
		if (!result)  logger.info(result)
		logger.info('connected to MongoDB')
	})
	.catch(error => {
		logger.info('error connection to MongoDB:', error.message)
	})

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/notes', middleware.userExtractor, notesRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
	const testingRouter = require('./controllers/testing')
	app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
