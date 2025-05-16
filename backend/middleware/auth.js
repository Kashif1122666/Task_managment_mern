import jwt from 'jsonwebtoken';

import userModel from "../model/userModel.js";
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

const { verify } = jwt;
export const authMiddleware = async (req, res, next) => {
    // grab the bearer token from the request headers 

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ success: false, message: 'Not authorized token Missing' });
    }
    const token = req.headers.authorization?.split(' ')[1];
    // verify and attach user object 
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(payload.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'user not found' });
        }
        req.user = user;
        next(); 
    } catch (error) {
        console.log("jwt verification failed", error);
        return res.status(401).json({ success: false, message: 'token invalid or expired' });
    }
}