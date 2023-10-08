export function prepareUserName(userName: string): string {
    return userName.trim().replaceAll('@', '');
}
