import {JWToken} from "../src/core/generateJWT.core";
import {SignOptionsInterface} from "../src/interfaces/signOptions.interface";
import {VerifyOptionsInterface} from "../src/interfaces/verifyOptions.interface";
import {VerifyAccessTokenInterface as VerifyResult} from "../src/interfaces/VerifyAccessTokenInterface";

const payload: Object = { userId: 123, role: "ROLE_ADMIN" };
const secret: string = 'my-secret';

const signOptions: SignOptionsInterface = {
    algorithm: 'HS256',
    expiresIn: '2m',
    audience: 'my-audience',
    subject: 'user',
    issuer: 'my-issuer',
    jwtId: 'unique-id',
    noTimestamp: true,
    header: { alg: 'HS256', typ: 'JWT' },
    encoding: 'base64'
};

const token: string = JWToken.sign(payload, secret, 'HS256', 'sha3-512', signOptions);
console.log('Token:', token);

const verifyOptions: VerifyOptionsInterface = {
    algorithm: 'HS256',
    audience: 'my-audience',
    subject: 'user',
    issuer: 'my-issuer',
    jwtId: 'unique-id',
    maxAge: '2h',
    clockTolerance: 10
};

//const tokenGeneratedExpires: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6IlJPTEVfQURNSU4iLCJleHAiOjE3MjE3OTA2NjYsImF1ZCI6Im15LWF1ZGllbmNlIiwic3ViIjoidXNlciIsImlzcyI6Im15LWlzc3VlciIsImp0aSI6InVuaXF1ZS1pZCJ9.WX_uATTp3F3t7_-CWzyfSXqYHsdSj32Vbr1aDkpePbLKnZxzJ64clScBNhg0M1czLi89xLyCddX0AMTFS78CvA";
const decodedPayload: VerifyResult = JWToken.verify(token, secret, 'sha3-512', verifyOptions);
//const decodedPayload: VerifyResult = JWToken.verify(tokenGeneratedExpires, secret, 'sha3-512', verifyOptions);
//const newToken: string | null = JWToken.refreshToken(tokenGeneratedExpires, secret, secret,'HS256', 'sha3-512', signOptions, verifyOptions);
const newToken: string | null = JWToken.refreshToken(token, secret, secret,'HS256', 'sha3-512', signOptions, verifyOptions);

console.log('Decoded Payload:', decodedPayload);
console.log('refreshToken Payload:', newToken);