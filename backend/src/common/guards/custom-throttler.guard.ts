import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
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
