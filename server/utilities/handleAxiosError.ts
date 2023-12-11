import {isAxiosError} from 'axios';
import {HttpException, HttpStatus} from '@nestjs/common';

export function handleAxiosError(
    error: unknown,
    messageByStatus: Record<number, string[]>,
) {
    if (isAxiosError(error)) {
        const statusCode = error.response?.status;

        throw new HttpException(
            statusCode ? messageByStatus[statusCode] : '',
            statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        );
    } else {
        throw error;
    }
}
