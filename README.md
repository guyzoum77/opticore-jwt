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
   
Signature:
```
sign(payload: object, privateSecretKey: string, headerAlgorithm: AlgorithmType, 
     signAlgorithm: HashAlgorithmType, options: SignOptionsInterface): string
```

**Parameters:**
* `payload` (object): The payload to include in the JWT. This typically contains user-specific data and claims.
* `secret` (string): The secret key used to sign the token.
* `algorithm` (string, optional): The hashing algorithm to use for signing. Defaults to 'HS256', currently supports only 'HS256'.

**Returns:**
* `string`: The generated JWT.

Example
```
import { JWToken } from 'opticore-jwt';
const payload = { userId: 123, role: "ROLE_ADMIN" };
const secret = 'my-secret' // we recommanding to use rsa key;

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

const token: string = JWToken.sign(payload, secret, 'HS256', 'sha3-512', signOptions);
console.log('Generated Token:', token);
Generated Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6IlJPTEVfQURNSU4iLCJleHAiOjE3MjE4MzMxNjMsImF1ZCI6Im15LWF1ZGllbmNlIiwic3ViIjoidXNlciIsImlzcyI6Im15LWlzc3VlciIsImp0aSI6InVuaXF1ZS1pZCJ9.3dW3Zq3WUD1ob0WVi0qTSst2JfzovzwtzX3F0Rqp8si7GvwdKYAAVkulgkWj1b6AMMYcUh5rtnHPmbPf3aiE3A
```

2. verify

   Purpose:
   Verifies the integrity of a JSON Web Token (JWT) and decodes its payload if the token is valid.

Signature:
```
verify(token: string, publicSecretKey: string, signAlgorithm: HashAlgorithmType, options: VerifyOptionsInterface): VerifyResultInterface
```
**Parameters:**
* `token` (string): The JWT to verify.
* `secret` (string): The secret key used to verify the token.
* `algorithm` (string, optional): The hashing algorithm used for verifying the token. Defaults to 'HS256'. Must match the algorithm used when signing the token.

**Returns:**
* `VerifyResultInterface`: The decoded payload if the token is valid, or null if verification fails.

#### VerifyResultInterface contains :
* `status:` 'VALID' | 'EXPIRED' | 'INVALID';
* `payload?:` VerifyDecodePayloadInterface;
* `message?:` string;

Example
```
import { JWToken } from 'opticore-jwt';

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
console.log('Decoded Payload:', decodedPayload);

Decoded Payload: {
  status: 'valid',
  payload: {
    userId: 123,
    role: 'ROLE_ADMIN',
    exp: 1721860239,
    aud: 'my-audience',
    sub: 'user',
    iss: 'my-issuer',
    jti: 'unique-id'
  }
}
```

3. refreshToken
   
   Purpose:
   
   The `refreshToken` method is used to generate a new JSON Web Token (JWT) based on the payload of an existing token. This is particularly useful when the existing token has expired but the payload is still valid and can be reissued. The method verifies the original token, checks if it has expired, and if valid, issues a new token with a fresh expiration time.

**Parameters:**
* `token` (string): The JWT to be refreshed. This token must be in the format `header.payload.signature`
* `secret` (string): The secret key used to sign the JWT. This key must match the one used to sign the original token.
* `signAlgorithm` (`HashAlgorithmType`): The algorithm used for signing the token. Common algorithms include 'HS256', 'HS384', and 'HS512'.
* `options` (`VerifyOptionsInterface`): An object containing verification options such as `clockTolerance` and expected values for claims like `audience`, `issuer`, etc.

**Return Value:**
* `string | null`: Returns a new JWT as a string if the original token is successfully verified and refreshed. Returns `null` if the token cannot be refreshed (e.g., if it is invalid or does not meet the required criteria).

Example
```
const token = 'your.jwt.token.here';
const secret = 'your-secret-key';
const options = { clockTolerance: 10, algorithm: 'HS256' }; // Example options

const newToken = JWToken.refreshToken(token, secret, 'HS256', options);
if (newToken) {
    console.log('New Token:', newToken);
    // implement your logic 
} else {
    console.log('Token could not be refreshed.');
    // implement your logic 
}
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

