import { z } from 'zod';

export const phase1Schema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  post: z.string().optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      'Enter a valid email address'
    ),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  localAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  landline: z.string().optional(),
  sameAddress: z.boolean().optional(),
});

export const phase2Schema = z
  .object({
    qualification: z.string().optional(),
    computerCourse: z.string().optional(),
    interviewDate: z.string().optional(),
    referenceName: z.string().optional(),
    dateOfJoining: z.string().optional(),
    experienceValue: z
      .number()
      .min(0, 'Experience cannot be negative')
      .nullable()
      .optional(),
    experienceUnit: z.enum(['years', 'months']).optional(),
  })
  .refine(
    (data) => {
      if (data.experienceValue !== null && data.experienceValue !== undefined) {
        return data.experienceUnit !== undefined;
      }
      return true;
    },
    {
      message: 'Please select the experience unit (years/months)',
      path: ['experienceUnit'],
    }
  )
  .refine(
    (data) => {
      if (data.experienceUnit) {
        return (
          data.experienceValue !== null && data.experienceValue !== undefined
        );
      }
      return true;
    },
    {
      message: 'Please enter the experience value',
      path: ['experienceValue'],
    }
  );

export const phase3Schema = z.object({
  emergencyMobile: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[6-9]\d{9}$/.test(val),
      'Enter a valid 10-digit Indian mobile number'
    ),
  emergencyPersonName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  willingnessDonateBlood: z.boolean().optional(),
  maritalStatus: z.enum(['single', 'married', 'other']).optional(),
  medicalHistory: z.string().optional(),
  legalHistory: z.string().optional(),
});

export const phase4Schema = z.object({
  religion: z.string().optional(),
  caste: z.string().optional(),
  spouseName: z.string().optional(),
  anniversaryDate: z.string().optional(),
});

export const fullSubmitSchema = z.intersection(
  z.intersection(phase1Schema, phase2Schema),
  z.intersection(phase3Schema, phase4Schema)
);

export type Phase1SchemaType = z.infer<typeof phase1Schema>;
export type Phase2SchemaType = z.infer<typeof phase2Schema>;
export type Phase3SchemaType = z.infer<typeof phase3Schema>;
export type Phase4SchemaType = z.infer<typeof phase4Schema>;
export type FullSubmitSchemaType = z.infer<typeof fullSubmitSchema>;
