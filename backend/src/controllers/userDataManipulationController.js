import db from '../config/db.js';
import { z } from 'zod';
import {Resend} from 'resend'; 
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';

const userUpdateSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.email("Invalid email format"),
});

const passwordSchema = z.object({
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
});

const resend = new Resend(process.env.RESEND_API_KEY);

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
            'UPDATE users SET username = ?, email = ?, updated_at = NOW() WHERE id = ?',
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

export const forgotPassword= async(req,res)=>{
    const {email}=req.body;
    try{
        const [user] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (user.length === 0) return res.status(404).send('Utilisateur introuvable');

        const userId = user[0].id;
        // 2. Generate Reset Token
        const token = randomBytes(20).toString('hex');
        const expiry = new Date(Date.now() + 3600000);

        // 3. Update MySQL User record
        await db.execute(
            'INSERT INTO users_password (user_id,reset_token, reset_token_expiry) VALUES (?,?,?) ON DUPLICATE KEY UPDATE reset_token=?, reset_token_expiry=?',
            [userId, token, expiry, token, expiry]
        );

        // 4. Send Email via Resend
        const { data, error } = await resend.emails.send({
            from: 'croire et obéir <noreply@mail.tommytabe.dev>', // Change to your verified domain in production
            to: [email], // Resend expects an array or a string
            subject: 'Demande de modification du mot de passe',
            html: `
                <p>Vous avez demandé une réinitialisation de mot de passe.</p>
                <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans 1 heure.</p>
                <a href="croire-et-obeir://reset-password?token=${token}">Réset mot de passe</a>
            `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return res.status(400).json({ error });
        }

        res.status(200).send(`Mot de passe a été envoyé à ${email}, c'est valable pour 1hr. Veuillez vérifier votre boîte de réception. `);
  
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

export const passwordReset = async (req, res) => {
    const { token, password } = req.body;

    if (!req.body)return res.status(400).json({ message: "Requête manquant" });
    const validation = passwordSchema.safeParse({ password });
     if (!validation.success) {
      // Use Optional Chaining (?.) to prevent the "map of undefined" crash
      const errorMessages = validation.error.issues.map(issue => issue.message); 
      
      return res.status(400).json({ 
        message: "Validation Error",
        errors: errorMessages 
      });
    }

    try {
        // 1. Find user by token and check expiry
        const [user] = await db.execute(
            'SELECT user_id FROM users_password WHERE reset_token = ? AND reset_token_expiry > ?',
            [token, new Date()]
        );

        if (user.length === 0) return res.status(400).send('Token invalide ou expiré');

        const userId = user[0].user_id;
        const hashedPassword = await bcrypt.hash(password, 12);
        // 3. Update the main users table
        await db.execute(
                'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
                [hashedPassword, userId]
            );

        // 4. Delete the reset token so it can't be used again
        await db.execute(
            'DELETE FROM users_password WHERE user_id = ?',
            [userId]
        );

        res.status(200).send('Mot de passe réinitialisé avec succès');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}