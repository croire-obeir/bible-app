import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import crypto from 'node:crypto';

export const refreshToken = async (req, res) => {
    let connection;

    try {
        const { refreshToken: oldRefreshToken } = req.body;

        if (!oldRefreshToken) {
            return res.status(401).json({
                message: 'Refresh token required'
            });
        }

        // Get a connection from the pool
        connection = await db.getConnection();

        // Find refresh token
        const [rows] = await connection.execute(
            `SELECT * FROM refresh_tokens WHERE token = ? LIMIT 1`,
            [oldRefreshToken]
        );

        const storedToken = rows[0];

        if (!storedToken) {
            return res.status(403).json({
                message: 'Invalid refresh token'
            });
        }

        // Check expiration
        if (new Date(storedToken.expires_at) < new Date()) {

            await connection.execute(
                `DELETE FROM refresh_tokens WHERE id = ?`,
                [storedToken.id]
            );

            return res.status(403).json({
                message: 'Refresh token expired'
            });
        }

        // Generate new access token
        const accessToken = jwt.sign(
            {
                userId: storedToken.user_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '30d'
            }
        );

        // Generate new refresh token
        const newRefreshToken = crypto
            .randomBytes(64)
            .toString('hex');

        // New refresh token expires in 1 year
        const refreshTokenExpiresAt = new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
        );

        // Start transaction
        await connection.beginTransaction();

        try {
            // Delete old refresh token
            await connection.execute(
                `DELETE FROM refresh_tokens WHERE id = ?`,
                [storedToken.id]
            );

            // Insert new refresh token
            await connection.execute(
                `INSERT INTO refresh_tokens 
                    (user_id, token, expires_at)
                 VALUES (?, ?, ?)`,
                [
                    storedToken.user_id,
                    newRefreshToken,
                    refreshTokenExpiresAt
                ]
            );

            // Everything succeeded
            await connection.commit();

        } catch (error) {
            // Something failed → undo DELETE/INSERT
            await connection.rollback();
            throw error;
        }

        // Return new tokens
        return res.json({
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Server error'
        });

    } finally {
        // Return connection to pool
        if (connection) {
            connection.release();
        }
    }
};