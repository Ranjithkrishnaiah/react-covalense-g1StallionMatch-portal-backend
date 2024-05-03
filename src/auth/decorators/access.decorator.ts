import { SetMetadata } from '@nestjs/common';

export const Access = (access: {
  allowed: string[];
  requestDataType: string;
  validateKey: {};
}) => {
  return SetMetadata('access', access);
};
