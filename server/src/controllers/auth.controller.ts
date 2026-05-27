import { Request, Response } from "express";
import prisma from "../config/db";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}
function tempUserName(email: string) {
    const localPart = email.split("@")[0]?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "user";
    return `${localPart}-${randomUUID().slice(0, 8)}`;
}

export async function Login(req: Request, res: Response) {
    // Implementation for login
    const {email, password} = req.body as{
        email: string;
        password: string;
    }
    if(!email || !password){
        return res.status(400).json({message: "Email and password are required"});
    }
    const user = await prisma.user.findUnique({
        where: {
            email: normalizeEmail(email)
        }
    });
    if(!user){
        return res.status(400).json({message: "Invalid email or password"});
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if(!isPasswordValid){
        return res.status(400).json({message: "Invalid email or password"});
    }
    return res.status(200).json({message: "Login successful"});
};

export async function Register(req: Request, res: Response) {
	// Implementation for register
    const {email, password} = req.body as{
        email: string;
        password: string;
    }
    if(!email || !password){
        return res.status(400).json({message: "Email and password are required"});
    }
    if(password.length < 8){
        return res.status(400).json({message: "Password must be at least 8 characters long"});
    }
    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizeEmail(email)
        }
    });
    if(existingUser){
        return res.status(400).json({message: "email already in use"});
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            email: normalizeEmail(email),
            passwordHash: passwordHash,
            username: tempUserName(email)
        },
        select:{
            id: true,
            email: true,
            username: true,
            createdAt: true
        }
    });
    return res.status(201).json({message: "User created successfully", newUser});
};
