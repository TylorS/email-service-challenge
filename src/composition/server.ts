import 'source-map-support/register'

import bodyParser from 'body-parser'
import express from 'express'

import { PORT } from '../infrastructure/constants'
import * as email from './email'

const app = express()

app.use(bodyParser.json())

app.post(email.route, email.post)

app.listen(PORT, () => console.info(`Server listening on ${PORT}`))
