import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MarketId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id_market;
  },
);
