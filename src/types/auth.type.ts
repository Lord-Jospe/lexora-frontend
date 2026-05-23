export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;

    user: {
        id: string;
        name: string;
        email: string;
        created_at: string;
    };
}
