import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

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

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email,password)

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, userId: user.id });
    } catch (err) {
        res.status(500).json({ error: err.message + "errrr" });
    }
};


export const googleLogin = async (req, res) => {
    const { idToken } = req.body; // Sent from the Mobile App (React Native/Flutter)

    try {
        // 1. Verify the token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: google_id, email, name: username, picture: avatar } = payload;

        // 2. Check if user exists by google_id OR by email
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE google_id = ? OR email = ?', 
            [google_id, email]
        );

        let user;

        if (rows.length > 0) {
            user = rows[0];
            
            // Link account: If they had a traditional account but no google_id yet
            if (!user.google_id) {
                await db.execute(
                    'UPDATE users SET google_id = ?, avatar = ? WHERE id = ?',
                    [google_id, avatar, user.id]
                );
            }
        } else {
            // 3. Create new user if they don't exist
            // Note: password is 'oauth_managed' because they don't have a traditional password
            const [result] = await db.execute(
                'INSERT INTO users (username, email, google_id, avatar, password) VALUES (?, ?, ?, ?, ?)',
                [username, email, google_id, avatar, 'oauth_managed']
            );
            
            const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUser[0];
        }

        // 4. Generate the same JWT your traditional login uses
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            userId: user.id, 
            user: { 
                username: user.username, 
                email: user.email, 
                avatar: user.avatar 
            } 
        });

    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(401).json({ message: 'Invalid Google Token' });
    }
};