import { MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';

import { MegabytesToBytes } from '../utils/megabytes-to-bytes';
import { IMAGES_TYPE_REGEX } from './regular-expressions';

export const EMAIL_EXAMPLE = 'test@test.com';
export const PASSWORD_EXAMPLE = 'Test123!';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 50;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const SPIDER_NAME_MAX_LENGTH = 20;
export const SPIDER_DESCRIPTION_MAX_LENGTH = 1000;

export const PASSWORD_ERROR =
  'password requires a lowercase letter, an uppercase letter, and a number or symbol';

export const MAX_FILE_SIZE = MegabytesToBytes(5);

export const DEFAULT_IMAGE_VALIDATORS = [
  new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
  new FileTypeValidator({ fileType: IMAGES_TYPE_REGEX }),
];
