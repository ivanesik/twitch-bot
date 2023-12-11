import {HttpStatus} from '@nestjs/common';

export const saveTokenErrorByStatus = {
    [HttpStatus.UNAUTHORIZED]: ['invalid access token.'],
};
