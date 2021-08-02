import * as R from '@typed/fp/Resume'
import { Handler } from 'express'
import { pipe } from 'fp-ts/function'

import { postEmail, PostEmailError, PostEmailRequirements } from '../application/postEmail'
import { logMessageToConsole } from '../infrastructure/logMessageToConsole'
import { sanitizeHtml } from '../infrastructure/sanitizeHtml'
import { saveEmailToMemory } from '../infrastructure/saveEmailToMemory'
import { sendEmailWithFallback } from '../infrastructure/sendEmailWithFallback'

const postEmailRequirements: PostEmailRequirements = {
  sendEmail: sendEmailWithFallback,
  logMessage: logMessageToConsole,
  sanitizeHtml: sanitizeHtml,
  saveEmail: saveEmailToMemory,
}

const postEmailErrorToResponseCode = (postEmailError: PostEmailError): number => {
  switch (postEmailError._tag) {
    case 'PostEmailBodyDecodeError':
      return 400
    case 'PostEmailSendError':
    case 'PostEmailSaveEmailError':
      return 500
  }
}

export const route = '/email'

export const post: Handler = (req, res, next) => {
  const task = pipe(postEmailRequirements, postEmail(req.body), R.toTask)

  task()
    .then((response) => {
      response.success
        ? res.status(201).json(response.email)
        : res.status(postEmailErrorToResponseCode(response.error)).end(response.error.message)
    })
    .catch(next)
}
