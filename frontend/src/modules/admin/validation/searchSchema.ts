import { z } from 'zod'

export const searchSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Mobile number must start with 6-9 and have exactly 10 digits'),
})

export type SearchFormValues = z.infer<typeof searchSchema>
