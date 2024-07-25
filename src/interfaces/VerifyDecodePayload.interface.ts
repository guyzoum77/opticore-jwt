export interface VerifyDecodePayloadInterface {
    exp?: number;
    nbf?: number;
    iat?: number;
    [key: string]: any;
}