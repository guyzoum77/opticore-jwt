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