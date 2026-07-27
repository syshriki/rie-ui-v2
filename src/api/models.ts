export interface RefreshTokenResponse {
    expiresAt: Date;
}

export interface IntrospectResponse {
    iat: number;
    exp: number;
    sub: string;
}
