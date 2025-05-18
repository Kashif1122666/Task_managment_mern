import userModel from "../model/userModel.js";
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({id:userId},JWT_SECRET,{expiresIn:TOKEN_EXPIRES});


// Register function 

export const registerUser = async (req,res) => {
    const {name,email,password} = req.body;
    if(!name || !email || !password) {
        return res.status(400).json({ success : false,  message: "All fields are required" });
    }
    if (!validator.isEmail(email)){
        return res.status(400).json ({success:false,message:"Invalid email"});
    }
    if (password.length < 8) {
        return res.status(400).json({ success : false,  message: "Password must be at least eight characters" });
        
    }
    try{
        if (await userModel.findOne({email})) {
            return res.status(409).json({success:false,message:"User already exists"});
        }
        const hashed = await bcrypt.hash(password,10)
        const user = await userModel.create({name,email,password:hashed});
        const token = createToken(user._id);
        res.status(201).json({success:true,token,user:{id:user._id,name: user.name, email:user.email}});
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}

// Login function 

export const loginUser = async (req,res) => {
    const {email,password} = req.body;
    if(!email || !password) {
        return res.status(400).json({ success : false,  message: "All fields are required" });
    }

    try {
       const user = await userModel.findOne({email});
       if (!user) {
        return res.status(404).json({success:false,message:"Invalid credentials or user not found"});
       } 
       const isMatch = await bcrypt.compare(password,user.password);
         if (!isMatch) {
          return res.status(401).json({success:false,message:"Invalid credentials"});
         }
         const token = createToken(user._id);
         res.status(200).json({success:true,token,user:{id:user._id,name: user.name, email:user.email}});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Internal server error"});
        
    }
}

// Get CURRENT user function
export const getCurrentUser = async (req,res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({success:false,message:"User not found"});
        }
        res.status(200).json({success:true,user:{id:user._id,name: user.name, email:user.email}});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}

// update user profile function

export const updateProfile = async (req,res) => {
    const {name,email} = req.body;
    if(!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({ success : false,  message: "valid name and email required" });
    }
    try {
        const exists = await userModel.findOne({email,_id:{$ne:req.user.id}});
        if (exists) {
            return res.status(404).json({success:false,message:"email already  in use by another account"});
        }
        const user = await userModel.findByIdAndUpdate( 
            req.user.id,
            {name,email},
            {new:true,runValidators:true , select : "name email "}
        );
        res.status(200).json({success:true,user});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}
// update user password function

export const updatePassword = async (req,res) => {
    const {currentPassword ,newPassword} = req.body;
    if(!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({ success : false,  message: "Password Invalid or too short" });
    }
    try {
        const user = await userModel.findById(req.user.id).select("password");
        if (!user) {
            return res.status(404).json({success:false,message:"User not found"});
        }
        const isMatch = await bcrypt.compare(currentPassword,user.password);
        if (!isMatch) {
            return res.status(401).json({success:false,message:"currentPassword is incorrect"});
        } 

       user.password = await bcrypt.hash(newPassword,10);
        await user.save();
        res.status(200).json({success:true,message:"Password updated successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}
