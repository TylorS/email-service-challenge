import * as DE from '@typed/fp/DecodeError'
import * as D from '@typed/fp/Decoder'
import * as E from '@typed/fp/Env'
import * as EE from '@typed/fp/EnvEither'
import * as Ei from 'fp-ts/Either'
import { flow, pipe } from 'fp-ts/function'
import { matchW } from 'fp-ts/These'

import { Email } from '../domain/model'

const props = {
  to: D.string,
  to_name: D.string,
  from: D.string,
  from_name: D.string,
  subject: D.string,
  body: D.string,
} as const

/**
 * Define a Schema for our expected JSON body
 */
export const PostEmailBody = pipe(
  D.struct(props),
  D.condemmMissingKeys, // Fail if there are missing keys
)

/**
 * Derive the TS type from the Schema
 */
export type PostEmailBody = D.OutputOf<typeof PostEmailBody>

/**
 * An Discriminated Union for each error that can occur during postEmail
 */
export type PostEmailError = PostEmailBodyDecodeError | PostEmailSendError | PostEmailSaveEmailError

export interface PostEmailBodyDecodeError {
  readonly _tag: 'PostEmailBodyDecodeError'
  readonly message: string
}

export interface PostEmailSendError {
  readonly _tag: 'PostEmailSendError'
  readonly message: string
}

export interface PostEmailSaveEmailError {
  readonly _tag: 'PostEmailSaveEmailError'
  readonly message: string
}

/**
 * Create a Decoder for our PostEmailBody
 */
export const postEmailBodyDecoder = pipe(
  D.unknownRecord,
  D.compose(PostEmailBody), // Use our PostEmailBody schema
)

/**
 * The JSON response our postEmail Handler will return.
 */
export type PostEmailResponse =
  | {
      readonly success: false
      readonly error: PostEmailError
    }
  | {
      readonly success: true
      readonly email: Email
    }

/**
 * Create a contract to externalize the implementation details of sending an email.
 */
export const sendEmail =
  E.op<(body: PostEmailBody) => E.Of<Ei.Either<string, Email>>>()('sendEmail')

/**
 * Create a contract to externalize the implementation details of logging a string
 */
export const logMessage = E.op<(message: string) => E.Of<void>>()('logMessage')

/**
 * Create a contract to externalize the implementation details of logging a string
 */
export const sanitizeHtml = E.op<(html: string) => E.Of<string>>()('sanitizeHtml')

/**
 * Create a contract to externalize the implementation details of sending an email.
 */
export const saveEmail = E.op<(body: Email) => E.Of<Ei.Either<string, void>>>()('saveEmail')

export type PostEmailRequirements = E.RequirementsOf<typeof sendEmail> &
  E.RequirementsOf<typeof logMessage> &
  E.RequirementsOf<typeof sanitizeHtml> &
  E.RequirementsOf<typeof saveEmail>

/**
 * The logical definition of our post email endpoint.
 */
export function postEmail(request: unknown): E.Env<PostEmailRequirements, PostEmailResponse> {
  const handleDecodeFailure = flow(
    DE.drawErrors,
    E.of,
    E.chainFirst(logMessage),
    EE.fromEnvL,
    EE.mapLeft(
      (message): PostEmailBodyDecodeError => ({ _tag: 'PostEmailBodyDecodeError', message }),
    ),
  )

  const sanitizeAndSendBody = (postEmailBody: PostEmailBody) =>
    pipe(
      postEmailBody.body,
      sanitizeHtml,
      E.map((sanitizedBody) => ({ ...postEmailBody, body: sanitizedBody })),
      E.chainW(sendEmail),
      EE.mapLeft(
        (message): PostEmailError => ({
          _tag: 'PostEmailSendError',
          message,
        }),
      ),
    )

  const logOptionalErrors = flow(DE.drawErrors, logMessage, EE.fromEnv)

  return pipe(
    postEmailBodyDecoder.decode(request),
    matchW(
      // Log our failures before returning
      handleDecodeFailure,
      // Send our email with a properly formatted PostEmailBody
      sanitizeAndSendBody,
      // Handle optional errors (like unexpected keys) by logging about them in parallel with sending the email
      (errors, postEmailBody) =>
        pipe(errors, logOptionalErrors, EE.apSecondW(sanitizeAndSendBody(postEmailBody))),
    ),
    // Save the created Email
    EE.chainFirstW(
      flow(
        saveEmail,
        EE.mapLeft((message): PostEmailError => ({ _tag: 'PostEmailSaveEmailError', message })),
      ),
    ),
    EE.match(
      // Generate our response in the failure case
      (error: PostEmailError): PostEmailResponse => ({ success: false, error }),
      // Generate our response in the success case
      (email: Email): PostEmailResponse => ({ success: true, email }),
    ),
  )
}
