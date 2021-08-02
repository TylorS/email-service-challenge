import { Branded } from '@typed/fp/Branded'

export interface Email {
  readonly id: EmailId
  readonly subject: string
  readonly body: SanitizedHtml
  readonly created: Date
  readonly from: {
    readonly name: string
    readonly email: EmailAddress
  }
  readonly to: {
    readonly name: string
    readonly email: EmailAddress
  }
}

export type EmailId = Branded<string, { readonly EmailId: unique symbol }>
export const EmailId = Branded<EmailId>()

export type EmailAddress = Branded<string, { readonly EmailAddress: unique symbol }>
export const EmailAddress = Branded<EmailAddress>()

export type SanitizedHtml = Branded<string, { readonly SanitizedHtml: unique symbol }>
export const SanitizedHtml = Branded<SanitizedHtml>()
