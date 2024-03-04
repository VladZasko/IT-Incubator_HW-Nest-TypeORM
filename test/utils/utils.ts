import { HttpStatus } from '@nestjs/common';

type HttpStatusKeys = keyof typeof HttpStatus;

export type HttpStatusType = (typeof HttpStatus)[HttpStatusKeys];
