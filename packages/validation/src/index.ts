import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  schoolName: z.string().optional().default('Independent')
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const SubmissionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  fileUrl: z.string().url(),
  academicLevel: z.enum(['ELEMENTARY', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'COLLEGE', 'GRADUATE', 'PROFESSIONAL']),
  license: z.string().default('CC-BY-4.0')
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SubmissionInput = z.infer<typeof SubmissionSchema>;
