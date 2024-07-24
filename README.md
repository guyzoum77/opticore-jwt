# OptiCore JWT Module

Overview
------------
This JWT (JSON Web Token) package provides functionality for creating (signing) and verifying JWTs in a Node.js environment using TypeScript. JWTs are a compact, URL-safe means of representing claims between two parties.

Installation
------------
<blockquote>npm i opticore-jwt</blockquote>

<p align="center">

<a href="https://github.com/guyzoum77/opticore-jwt/actions?query=workflow%3ATests+branch%3Amaster"><img src="https://github.com/opticore-hashpassword/workflows/Tests/badge.svg?branch=master" alt="GitHub Actions Build Status"></a></p>


Usage
-------------
<blockquote>import {JWToken} from "opticore-jwt";</blockquote>

API Reference
-------------
1. sign
   Purpose:
   Creates a JSON Web Token (JWT) by encoding a payload with a specified secret and algorithm.
```
Signature:
sign(payload: object, privateSecretKey: string, headerAlgorithm: AlgorithmType, 
     signAlgorithm: HashAlgorithmType, options: SignOptionsInterface): string
```

**Parameters:**
* `payload` (object): The payload to include in the JWT. This typically contains user-specific data and claims.
* `secret` (string): The secret key used to sign the token.
* `algorithm` (string, optional): The hashing algorithm to use for signing. Defaults to 'HS256', currently supports only 'HS256'.

**Returns:**
* `string`: The generated JWT.

```
import { JWToken } from 'opticore-jwt';
const payload = { userId: 123 };
const secret = 'my-secret-key';
const token = JWToken.sign(payload, secret);

console.log('Generated Token:', token);
Generated Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6IlJPTEVfQURNSU4iLCJleHAiOjE3MjE4MzMxNjMsImF1ZCI6Im15LWF1ZGllbmNlIiwic3ViIjoidXNlciIsImlzcyI6Im15LWlzc3VlciIsImp0aSI6InVuaXF1ZS1pZCJ9.3dW3Zq3WUD1ob0WVi0qTSst2JfzovzwtzX3F0Rqp8si7GvwdKYAAVkulgkWj1b6AMMYcUh5rtnHPmbPf3aiE3A
```

2. verify
   Purpose:
   Verifies the integrity of a JSON Web Token (JWT) and decodes its payload if the token is valid.
```
Signature:
verify(token: string, publicSecretKey: string, signAlgorithm: HashAlgorithmType, options: VerifyOptionsInterface): object | null
```
**Parameters:**
* `token` (string): The JWT to verify.
* `secret` (string): TThe secret key used to verify the token.
* `algorithm` (string, optional): The hashing algorithm used for verifying the token. Defaults to 'HS256'. Must match the algorithm used when signing the token.

**Returns:**
* `object | null `: The decoded payload if the token is valid, or null if verification fails.



Example
-------------
```
import { JWToken } from 'opticore-jwt';

const payload = { userId: 123, role: "ROLE_ADMIN" };
const secret = 'my-secret' // or you can use rsa key;

const signOptions = {
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

// generate a token
const token: string = JWToken.sign(payload, secret, 'HS256', 'sha3-512', signOptions);

// verify token generated
const verifyOptions: VerifyOptionsInterface = {
    algorithm: 'HS256',
    audience: 'my-audience',
    subject: 'user',
    issuer: 'my-issuer',
    jwtId: 'unique-id',
    maxAge: '2h',
    clockTolerance: 10
};
const decodedPayload = JWToken.verify(token, secret, 'sha3-512', verifyOptions);
```
### **Notice**
```
it is recommended to use an RSA key as a secret for signature as well as verification.
And you must ensure that the algorithm passed as a parameter in the sign method must be the same as the one passed as a parameter in the verify method
```

Security Issues
---------------
https://github.com/guyzoum77/opticore-jwt/issues

Contributing
------------
OptiCore jwt module is an Open Source, so if you would like to contribute, you're welcome. Clone repository and open pull request.

About
--------
OptiCore jwt module is led by **Guy-serge Kouacou** and supported by **Guy-serge Kouacou**

