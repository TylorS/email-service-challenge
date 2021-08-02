import { fromIO } from '@typed/fp/Env'
import sanitize from 'sanitize-html'

/**
 * Strips out unwanted HTML like <script> tags
 */
export function sanitizeHtml(body: string) {
  return fromIO(() => sanitize(body))
}
