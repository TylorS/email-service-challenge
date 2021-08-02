import * as E from '@typed/fp/Env'
import * as EE from '@typed/fp/EnvEither'
import { matchW } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { Email } from 'src/domain/model'

import { PostEmailBody } from '../application/postEmail'
import { PREFERRED_PROVIDER } from './constants'
import { logMessageToConsole } from './logMessageToConsole'
import { sendEmailWithMailGun } from './sendEmailWithMailGun'
import { sendEmailWithSendGrid } from './sendEmailWithSendGrid'

/**
 * Implements our application's "sendEmail" API by attempting to
 * send with SendGrid, and if any failures occurs, attempts to send with MailGun.
 */
export function sendEmailWithFallback(body: PostEmailBody) {
  const sendGrid = pipe(body, sendEmailWithSendGrid, sentWith('SendGrid'))
  const mailGun = pipe(body, sendEmailWithMailGun, sentWith('MailGun'))

  const firstProvider = PREFERRED_PROVIDER === 'MailGun' ? mailGun : sendGrid
  const secondProvider = PREFERRED_PROVIDER === 'MailGun' ? sendGrid : mailGun

  return pipe(
    logMessageToConsole(`Sending Email: ${JSON.stringify(body)}`),
    EE.fromEnv,
    EE.chain(() => firstProvider),
    EE.orElse(() => secondProvider),
  )
}

// Log about which provider succeeded and failed
const sentWith = (provider: string) =>
  E.chainFirstW(
    matchW(logMessageToConsole, (email: Email) =>
      logMessageToConsole(`Sent with ${provider}: ${JSON.stringify(email, null, 2)}`),
    ),
  )
