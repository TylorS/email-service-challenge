import { drawErrors } from '@typed/fp/DecodeError'
import * as D from '@typed/fp/Decoder'
import { config as loadEnvVars } from 'dotenv'
import { pipe } from 'fp-ts/function'
import { isRight } from 'fp-ts/These'

loadEnvVars()

export type Provider = 'SendGrid' | 'MailGun'

const envVarDecoder = pipe(
  D.unknownRecord,
  D.compose(
    D.fromStruct({
      SENDGRID_API_KEY: D.string,
      MAILGUN_API_KEY: D.string,
      MAILGUN_DOMAIN: D.string,
      PORT: pipe(D.string, D.map(parseFloat)),
      PREFERRED_PROVIDER: pipe(
        D.string,
        D.refine((x): x is Provider => x === 'SendGrid' || x === 'MailGun', 'Provider'),
      ),
    }),
  ),
  D.condemmMissingKeys,
)

const these = envVarDecoder.decode(process.env)

if (!isRight(these)) {
  throw new TypeError(drawErrors(these.left))
}

if (process.env.NODE_ENV === 'development') {
  console.info('Env Vars\n', JSON.stringify(these.right, null, 2))
}

export const { SENDGRID_API_KEY, MAILGUN_API_KEY, MAILGUN_DOMAIN, PORT, PREFERRED_PROVIDER } =
  these.right
