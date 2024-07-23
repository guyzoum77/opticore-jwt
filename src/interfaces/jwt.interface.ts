import {JwtHeader} from "./jwtHeader.interface";
import {JwtPayload} from "./jwtPayload.interface";

export interface JwtInterface {
    header: JwtHeader;
    payload: JwtPayload | string;
    signature: string;
}