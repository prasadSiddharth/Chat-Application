import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3*24*60*60*60*1000;
const createToken = (email, userId) => {
    return jwt.sign({email, userId}, process.env.JWT_KEY, 
        {expiresIn: maxAge},
    )
};


export const signup=async (req, res, next) => {
    try{
        const {email, password}=req.body;
        if(!email || !password){
            return res.status(400).send("Email and Password are necessary");
        }

        const user=await User.create({email, password});
        res.cookie("jwt", createToken(email, user.id), {
            maxAge,
            secure: true, 
            sameSite: "None",
        });

        return res.status(201).json({user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image, 
            profileSetup: user.profileSetup,
        }});
    }catch(err){
        console.log(err.message);
        res.status(500).send("Internal Server Error!");
    }
}

export const login = async (req, res, next) => {
    try{
        const {email, password}=req.body;
        if(!email || !password){
            return res.status(400).send("Email and Password are necessary");
        }

        const user=await User.findOne({email});
        if(!user){
            return res.status(404).send("User not Found!");
        }

        const auth=await compare(password, user.password);
        if(!auth){
            return res.status(404).send("Password is Incorrect!");
        }

        res.cookie("jwt", createToken(email, user.id), {
            maxAge, secure: true, sameSite: "None",
        });
        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email, 
                profileSetup: user.profileSetup, 
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            }
        });
    }catch(err){
        console.log(err.message);
        return res.status(500).send("Internal Server Error!");
    }
} 

export const getUserInfo = async (req, res, next) => {
    try{
        const userData=await User.findById(req.userId);
        if(!userData){
            return res.status(404).send("User not Found!");
        }

        return res.status(201).json({
            id: userData.id,
            email: userData.email, 
            profileSetup: userData.profileSetup, 
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    }catch(err){
        console.log(err.message);
        return res.status(500).send("Internal Server Error!");
    }
}

export const updateProfile = async (req, res, next) => {
    try{
        const {userId}=req;
        const {firstName, lastName, image, color}=req.body;
        // something about color also
        if(!firstName || !lastName){
            return res.status(400).send("Missing Credentials!");
        }


        const userData=await User.findByIdAndUpdate(userId, {
            firstName, lastName, image, color,
            profileSetup: true,
        }, {new: true, runValidators: true});

        return res.status(201).json({
            id: userData.id,
            email: userData.email, 
            profileSetup: userData.profileSetup, 
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    }catch(err){
        console.log(err.message);
        return res.status(500).send("Internal Server Error!");
    }
}

export const addProfileImage = async (req, res, next) => {
    try{
        const {userId}=req;
        const {firstName, lastName, image, color}=req.body;
        // something about color also
        if(!firstName || !lastName){
            return res.status(400).send("Missing Credentials!");
        }


        const userData=await User.findByIdAndUpdate(userId, {
            firstName, lastName, image, color,
            profileSetup: true,
        }, {new: true, runValidators: true});

        return res.status(201).json({
            id: userData.id,
            email: userData.email, 
            profileSetup: userData.profileSetup, 
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    }catch(err){
        console.log(err.message);
        return res.status(500).send("Internal Server Error!");
    }
}

export const removeProfileImage = async (req, res, next) => {
    try{
        const {userId}=req;
        const user=await User.findById(userId);

        if(!user){
            return res.status(404).send("User not Found!");
        }   

        if(user.image){
            unlinkSync(user.image);
        }
        user.image=null;
        await user.save();
        return res.status(200).message("Profile Image Removed Successfully!"); 
    }catch(err){
        console.log(err.message);
        return res.status(500).send("Internal Server Error!");
    }
}

export const logout = async (req, res, next) => {
    try{
        res.cookie("jwt", "", {maxAge: 1, secure: true, sameSite: "None"});
        return res.status(200).message("Logout Successfull!"); 
    }catch(err){
        console.log(err.message);
        return res.status(500).send("Internal Server Error!");
    }
}