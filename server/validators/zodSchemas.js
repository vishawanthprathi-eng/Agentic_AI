import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['admin', 'member']).optional().default('member')
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const codeUploadSchema = z.object({
  file_name: z.string().min(1, 'File name is required').max(255, 'File name is too long'),
  code_content: z.string().min(1, 'Code content cannot be empty')
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: "Role must be either 'admin' or 'member'" })
  })
});

// Middleware helper for validating request body with Zod
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  req.validatedBody = result.data;
  next();
};
