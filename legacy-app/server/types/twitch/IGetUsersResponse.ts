export interface ITwitchUserFromResponse {
    id: string;
    login: string;
    display_name: string;
    type: 'admin' | 'global_mod' | 'staff' | '';
    broadcaster_type: 'affiliate' | 'partner' | '';
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    created_at: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
}

export interface IGetUsersResponse {
    data: ITwitchUserFromResponse[];
}
