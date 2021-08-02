import sendgrid from '@sendgrid/mail'
import * as E from '@typed/fp/Env'
import { Either, left, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { v4 } from 'uuid'

import { PostEmailBody } from '../application/postEmail'
import { Email, EmailId } from '../domain/model'
import { SENDGRID_API_KEY } from './constants'

/**
 * Implements our application's "sendEmail" API using the SendGrid API
 */
export function sendEmailWithSendGrid({
  from,
  from_name,
  to,
  to_name,
  subject,
  body,
}: PostEmailBody): E.Of<Either<string, Email>> {
  sendgrid.setApiKey(SENDGRID_API_KEY)

  return pipe(
    E.fromTask(() =>
      sendgrid
        .send({
          from: { email: from, name: from_name },
          to: { email: to, name: to_name },
          subject,
          html: body,
        })
        .then(
          ([response]) =>
            response.statusCode === 202
              ? right({
                  id: EmailId(v4()),
                  created: new Date(),
                  subject,
                  body,
                  from: {
                    email: from,
                    name: from_name,
                  },
                  to: {
                    email: to,
                    name: to_name,
                  },
                })
              : left(
                  `Unexpected Response From SendGrid: ${response.statusCode}: ${JSON.stringify(
                    response.body,
                    null,
                    2,
                  )}`,
                ),
          (e) => left(e instanceof Error ? e.message : `Unknown Error: ${e}`),
        ),
    ),
  )
}
