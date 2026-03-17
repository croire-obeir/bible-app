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
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
                    <p>Bonjour,</p>
                    
                    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>Croire et Obéir</strong>.</p>
                    
                    <p>Pour définir un nouveau mot de passe, veuillez cliquer sur le bouton ci-dessous. Ce lien est valable pour une durée de <strong>1 heure</strong> :</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000/reset-password?token=${token}" 
                        style="background-color: #007AFF; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Réinitialiser mon mot de passe
                        </a>
                    </p>
                    
                    <p>Si vous n'avez pas sollicité cette modification, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel restera inchangé.</p>
                    
                    <p>Cordialement,<br>
                    L'équipe Croire et Obéir</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
                    <p style="font-size: 11px; color: #999;">
                        Note : Si le bouton ne s'affiche pas correctement, copiez le lien suivant dans votre navigateur :<br>
                        http://localhost:3000/reset-password?token=${token}
                    </p>
                </div>
                        `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return res.status(400).json({ error });
        }

        res.status(200).send(`un lien pour renouveler votre mot de passe a été envoyé à ${email}. Attention, ce lien expirera dans 60 minutes. Pensez à vérifier vos spams. `);
  
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

        if (user.length === 0) return res.status(400).json({ 
            message: "Lien de réinitialisation invalide ou expiré. Veuillez refaire une demande de réinitialisation. \nRetournez sur l'application Croire et Obéir et cliquez sur \"Mot de passe oublié\" pour recevoir un nouveau lien.",
            success: true 
        });

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

        res.status(200).json({ 
            message: "Votre nouveau mot de passe est maintenant actif.Vous pouvez fermer cette page et retourner sur l\'application Croire et Obéir pour vous connecter.",
            success: true 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}