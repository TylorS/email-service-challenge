import * as E from '@typed/fp/Env'
import { Either, left, right } from 'fp-ts/Either'
import createClient from 'mailgun-js'
import { v4 } from 'uuid'

import { PostEmailBody } from '../application/postEmail'
import { Email, EmailId } from '../domain/model'
import { MAILGUN_API_KEY, MAILGUN_DOMAIN } from './constants'

const client = createClient({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN })

/**
 * Implements our application's "sendEmail" API using the MailGun API
 */
export function sendEmailWithMailGun({
  from,
  from_name,
  to,
  to_name,
  subject,
  body,
}: PostEmailBody): E.Of<Either<string, Email>> {
  return E.fromTask(() =>
    client
      .messages()
      .send({
        from,
        to,
        subject,
        html: body,
      })
      .then(
        () =>
          right({
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
          }),
        (e) => left(e instanceof Error ? e.message : `Unknown Error: ${e}`),
      ),
  )
}
