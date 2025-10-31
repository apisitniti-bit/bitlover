import { Request, Response } from 'express';
import { prisma } from '../server';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { body, validationResult } from 'express-validator';

export const authController = {
  // Register new user
  register: [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }

        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          res.status(400).json({ error: 'User already exists with this email' });
          return;
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
          },
        });

        // Create default user settings
        await prisma.userSettings.create({
          data: {
            userId: user.id,
            theme: 'dark',
            currency: 'USD',
            notifications: true,
          },
        });

        // Generate token
        const token = generateToken({ userId: user.id, email: user.email });

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        });
      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
      }
    },
  ],

  // Login user
  login: [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }

        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          res.status(401).json({ error: 'Invalid email or password' });
          return;
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
          res.status(401).json({ error: 'Invalid email or password' });
          return;
        }

        // Generate token
        const token = generateToken({ userId: user.id, email: user.email });

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
      }
    },
  ],

  // Get user profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          userSettings: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // Update user profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, theme, currency, notifications } = req.body;

      // Update user
      if (name) {
        await prisma.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      // Update settings
      if (theme || currency || notifications !== undefined) {
        await prisma.userSettings.upsert({
          where: { userId },
          update: {
            ...(theme && { theme }),
            ...(currency && { currency }),
            ...(notifications !== undefined && { notifications }),
          },
          create: {
            userId,
            theme: theme || 'dark',
            currency: currency || 'USD',
            notifications: notifications !== undefined ? notifications : true,
          },
        });
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          userSettings: true,
        },
      });

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Reset password
  resetPassword: [
    body('email').isEmail().withMessage('Invalid email address'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }

        const { email, newPassword } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          res.status(404).json({ error: 'No account found with this email address' });
          return;
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password in database
        await prisma.user.update({
          where: { email },
          data: { password: hashedPassword },
        });

        console.log(`✅ Password reset successful for user: ${email}`);

        res.json({
          message: 'Password reset successful. You can now log in with your new password.',
        });
      } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password. Please try again.' });
      }
    },
  ],
};
