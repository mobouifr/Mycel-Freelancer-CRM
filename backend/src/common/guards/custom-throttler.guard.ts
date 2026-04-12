import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  // Skip throttling for authenticated requests — JWT guards already protect
  // those routes. Keep rate-limiting only for unauthenticated public endpoints
  // (login, signup, oauth callbacks) to prevent brute-force / abuse.
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // Authenticated if the request carries a Bearer token or a jwt cookie
    const hasAuthHeader = !!req?.headers?.authorization?.startsWith('Bearer ');
    const hasJwtCookie  = !!req?.cookies?.jwt;
    return hasAuthHeader || hasJwtCookie;
  }

  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: any): Promise<void> {
    const response = context.switchToHttp().getResponse();
    const waitSecondsRaw = Number(throttlerLimitDetail?.timeToBlockExpire ?? throttlerLimitDetail?.timeToExpire ?? 0);
    const retryAfterSeconds = Math.max(1, Math.ceil(waitSecondsRaw));

    if (response?.setHeader) {
      response.setHeader('Retry-After', String(retryAfterSeconds));
    }

    throw new HttpException({
      message: `Rate limit reached. Please wait ${retryAfterSeconds} second${retryAfterSeconds > 1 ? 's' : ''} before trying again.`,
      retryAfterSeconds,
    }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
