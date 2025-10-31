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
      // Store error in request so controller can handle it
      const request = context.switchToHttp().getRequest();
      request.authError =
        error?.response?.message || error?.message || 'Authentication failed';

      // Return true to let controller handle the redirect
      return true;
    }
  }

  handleRequest(err: any, user: any) {
    // Return user even if there's an error
    // We'll check for authError in the controller
    return user || null;
  }
}
