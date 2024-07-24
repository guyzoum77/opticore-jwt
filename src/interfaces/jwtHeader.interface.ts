/**
 * alg: (Algorithm) The algorithm used to sign the token, e.g., "HS256", "RS256".
 * typ: (Type) The type of token, typically "JWT" for JSON Web Tokens.
 * cty: (Content Type) The content type of the JWT. Used to indicate that the payload is a nested JWT.
 * kid: (Key ID) A hint indicating which key was used to secure the JWT.
 * jku: (JWK Set URL) A URL to a set of JSON-encoded public keys, one of which corresponds to the key used to sign the JWT.
 * x5u: (X.509 URL) A URL to an X.509 certificate or certificate chain in PEM format.
 * x5t: (X.509 Certificate SHA-1 Thumbprint) A base64url-encoded SHA-1 thumbprint (digest) of the DER encoding of an X.509 certificate.
 * "x5t#S256": (X.509 Certificate SHA-256 Thumbprint) A base64url-encoded SHA-256 thumbprint (digest) of the DER encoding of an X.509 certificate.
 * x5c: (X.509 Certificate Chain) Contains the X.509 public key certificate or certificate chain corresponding to the key used to sign the JWT.
 * crit: (Critical) Indicates which extensions are critical for the JWT to be processed. If the recipient does not understand any of the critical extensions, it must reject the JWT.
 *
 */
export interface JwtHeader {
    alg: string | Algorithm;
    typ?: string | undefined;
    cty?: string | undefined;
    [key: string]: any;
    crit?: Array<string | Exclude<keyof JwtHeader, "crit">> | undefined;
    kid?: string | undefined;
    jku?: string | undefined;
    x5u?: string | string[] | undefined;
    "x5t#S256"?: string | undefined;
    x5t?: string | undefined;
    x5c?: string | string[] | undefined;
}