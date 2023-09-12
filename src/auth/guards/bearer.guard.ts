import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BEARER } from '../constants/strategy';

@Injectable()
export class BearerGuard extends AuthGuard(BEARER) {}
