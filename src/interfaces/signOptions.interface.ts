import {JwtHeader} from "./jwtHeader.interface";
import {AlgorithmType} from "../types/algorithm.type";

export interface SignOptionsInterface {
    algorithm?: AlgorithmType;
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