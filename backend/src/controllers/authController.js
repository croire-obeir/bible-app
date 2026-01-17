import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const signup=async(req,res)=>{
    const { email, password, username } = req.body;
    console.log(email,password,username)
    
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