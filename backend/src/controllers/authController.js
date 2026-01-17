import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { z } from 'zod';

const signupSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.email("Invalid email format"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
});

export const signup=async(req,res)=>{
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const validation = signupSchema.safeParse(req.body);
    
    // Handle Validation Error
    if (!validation.success) {
      // Use Optional Chaining (?.) to prevent the "map of undefined" crash
      const errorMessages = validation.error.issues.map(issue => issue.message); 
      
      return res.status(400).json({ 
        message: "Validation Error",
        errors: errorMessages 
      });
    }

    const { email, password, username } = req.body;

    try {
        // 1. Check if the user already exists
        const checkSql = 'SELECT * FROM users WHERE email = ?';
        const [existingUser] = await db.execute(checkSql, [email]);

        if (existingUser.length > 0) {
            // 409 Conflict is the standard status code for duplicate entries
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // 2. Hash the password (only if user doesn't exist)
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // 3. Insert into MySQL
        const insertSql = 'INSERT INTO users (email, password, username) VALUES (?, ?, ?)';
        await db.execute(insertSql, [email, hashedPassword, username]);
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}