import { ExecutionContext, Injectable } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const activate = (await super.canActivate(context)) as boolean;
      return activate;
    } catch (error) {
      const request = context.switchToHttp().getRequest();
      request.authError =
        error?.response?.message || error?.message || 'Authentication failed';

      return true;
    }
  }

  handleRequest(err: any, user: any) {
    return user || null;
  }
}
