import {JwtHeader} from "./jwtHeader.interface";

export interface SignOptionsInterface {
    algorithm?: Algorithm;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    subject?: string;
    issuer?: string;
    jwtId?: string;
    mutatePayload?: boolean;
    noTimestamp?: boolean;
    header?: JwtHeader;
    encoding?: string;
    allowInsecureKeySizes?: boolean;
    allowInvalidAsymmetricKeyTypes?: boolean;
}