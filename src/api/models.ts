export interface RefreshTokenResponse {
    expiresAt: Date;
}

export interface IntrospectResponse {
    iat: number;
    exp: number;
    sub: string;
}

export interface Recipe {
    slug: string;
    id: number;
    title: string;
    description: string;
    recipe: string;
    authorId: string;
}

export interface RecipeBySlug {
    slug: string;
    id: number;
    title: string;
    description: string;
    recipe: string;
    authorId: string;
    authorUsername: string;
    createdAt: string;
}

export interface RecipeResponse {
    recipes: Recipe[];
    pagination: {
        hasMore: boolean;
        nextCursor: string | null;
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
}