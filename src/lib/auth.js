import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this';
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(inputPassword, storedPassword) {
    return await bcrypt.compare(inputPassword, storedPassword);
}

export async function signToken(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(key);
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}
