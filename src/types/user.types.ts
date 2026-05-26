export interface UserUpdateRequest {
    name?: string;
    email?: string;
    password?: string;
}

export interface UserProfileResponse {
    name: string;
    email: string;
    created_at: string;
}


