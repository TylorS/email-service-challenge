import * as E from '@typed/fp/Env'
import * as EE from '@typed/fp/EnvEither'
import { toTask } from '@typed/fp/Resume'
import { deepStrictEqual } from 'assert'
import { constVoid, pipe } from 'fp-ts/function'
import { describe } from 'mocha'
import { Email, EmailId } from 'src/domain/model'
import { v4 } from 'uuid'

import { postEmail, PostEmailBody, PostEmailRequirements, PostEmailResponse } from './postEmail'

describe(__filename, () => {
  describe(postEmail.name, () => {
    describe('given an invalid request body', () => {
      const expected: PostEmailResponse = {
        success: false,
        error: {
          _tag: 'PostEmailBodyDecodeError',
          message: `MissingKeys
├─ to
├─ to_name
├─ from
├─ from_name
├─ subject
└─ body`,
        },
      }

      itEnv(
        'returns an PostEmailBodyDecodeError response',
        pipe(
          postEmail({}),
          E.chainFirstW((x) => E.fromIO(() => deepStrictEqual(x, expected))),
        ),
        createTestPostRequirements(),
      )
    })

    describe('given a valid request body', () => {
      const body = createTestPostEmailBody()
      const email = creatTestEmail(body)

      describe('given sendEmail + saveEmail both succeed', () => {
        const expected: PostEmailResponse = {
          success: true,
          email,
        }

        itEnv(
          'sends the email',
          pipe(
            body,
            postEmail,
            E.chainFirstW((x) => E.fromIO(() => deepStrictEqual(x, expected))),
          ),
          createTestPostRequirements({
            sendEmail: () => EE.right(email),
            saveEmail: () => EE.right(void 0),
          }),
        )
      })

      describe('given sendEmail Fails', () => {
        const expected: PostEmailResponse = {
          success: false,
          error: { _tag: 'PostEmailSendError', message: `No Configured Providers` },
        }

        itEnv(
          'returns an PostEmailSendError response',
          pipe(
            body,
            postEmail,
            E.chainFirstW((x) => E.fromIO(() => deepStrictEqual(x, expected))),
          ),
          createTestPostRequirements({
            saveEmail: () => EE.right(void 0),
          }),
        )
      })

      describe('given saveEmail Fails', () => {
        const expected: PostEmailResponse = {
          success: false,
          error: { _tag: 'PostEmailSaveEmailError', message: `No Configured DB` },
        }

        itEnv(
          'returns an PostEmailSaveEmailError response',
          pipe(
            body,
            postEmail,
            E.chainFirstW((x) => E.fromIO(() => deepStrictEqual(x, expected))),
          ),
          createTestPostRequirements({
            sendEmail: () => EE.right(email),
          }),
        )
      })
    })

    describe('given a valid request body with extra properties', () => {
      const body = { ...createTestPostEmailBody(), extra: 'property' }
      const email = creatTestEmail(body)

      itEnv(
        'sends the email',
        pipe(body, postEmail),
        createTestPostRequirements({
          logMessage: (message) =>
            E.fromIO(() => {
              deepStrictEqual(message, 'UnexpectedKeys\n└─ extra')
            }),
          sendEmail: () => EE.right(email),
          saveEmail: () => EE.right(void 0),
        }),
      )
    })
  })
})

function createTestPostEmailBody(options: Partial<PostEmailBody> = {}): PostEmailBody {
  return {
    to: 'fake@example.com',
    to_name: 'Mr. Fake',
    from: 'no.reply@example.com',
    from_name: 'Ms. Fake',
    subject: 'A message from The Fake Family',
    body: '<h1>Your Bill</h1><p>$10</p>',
    ...options,
  }
}

export function creatTestEmail({
  subject,
  body,
  from,
  from_name,
  to,
  to_name,
}: PostEmailBody): Email {
  return {
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
  }
}

function createTestPostRequirements(
  options: Partial<PostEmailRequirements> = {},
): PostEmailRequirements {
  return {
    logMessage: () => E.fromIO(constVoid),
    sanitizeHtml: (html) => E.fromIO(() => html),
    sendEmail: () => EE.left(`No Configured Providers`),
    saveEmail: () => EE.left(`No Configured DB`),
    ...options,
  }
}

function itEnv<E>(does: string, test: E.Env<E, any>, requirements: E) {
  return it(does, pipe(requirements, test, toTask))
}
