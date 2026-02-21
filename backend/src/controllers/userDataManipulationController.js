import db from '../config/db.js';
import { z } from 'zod';

const userUpdateSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.email("Invalid email format"),
});

export const updateUserData = async (req, res) => {
     if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    
    const validation = userUpdateSchema.safeParse(req.body);
    
    // Handle Validation Error
    if (!validation.success) {
      // Use Optional Chaining (?.) to prevent the "map of undefined" crash
      const errorMessages = validation.error.issues.map(issue => issue.message); 
      
      return res.status(400).json({ 
        message: "Validation Error",
        errors: errorMessages 
      });
    }
    const {userId} = req.params;
    const {username, email} = req.body;

    try {
        const [result] = await db.query(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            [username, email, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        // 3. Fetch the updated user data to return it
        // Note: We fetch 'username' specifically since your query updated 'name'
        const [rows] = await db.query(
            'SELECT username, email FROM users WHERE id = ?', 
            [userId]
        );

        const updatedUser = rows[0];

        // 4. Send back the success message + the data
        res.json({ 
            message: "User data updated successfully",
            data: {
                username: updatedUser.username,
                email: updatedUser.email
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const deleteUserData = async (req, res) => {
    const {userId} = req.params;

    try {
        const [result] = await db.query(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}