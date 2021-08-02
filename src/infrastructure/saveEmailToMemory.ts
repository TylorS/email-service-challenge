import { fromIO } from '@typed/fp/EnvEither'

import { Email } from '../domain/model'

export function saveEmailToMemory(email: Email) {
  return fromIO(() => {
    console.info(`[NO DB CONFIGURED] Saving Email ${email.id}...`)
  })
}
