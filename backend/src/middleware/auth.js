import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    // 1. Get the token from the header (Format: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        // 2. Verify the token using your secret key
        const verified = jwt.verify(token, "my_secret");
        
        // 3. Add the user data (like id) to the request object
        req.user = verified; 
        
        // 4. Move to the next function (your API logic)
        next(); 
    } catch (err) {
        res.status(403).json({ message: "Invalid or Expired Tokenn" });
    }
};
export default verifyToken;