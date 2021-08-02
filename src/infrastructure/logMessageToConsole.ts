import { fromIO } from '@typed/fp/Env'
import { info } from 'fp-ts/Console'

/**
 * A console based implementation of or "logMessage" API in the application layer
 */
export function logMessageToConsole(message: string) {
  return fromIO(info(message))
}
