import {JWT} from "../src/services/generateJWT.service";

const payload = { userId: 123, role: "ROLE_ADMIN" };
const secret = 'my-secret';

const token = JWT.sign(payload, secret, 'HS256', 'sha3-512');
console.log('Token:', token);

const decodedPayload = JWT.verify(token, secret, 'sha3-512');
console.log('Decoded Payload:', decodedPayload);