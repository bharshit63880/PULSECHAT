import { z } from 'zod';

import { deviceRegistrationSchema } from './auth';
import { deviceIdSchema } from './common';

export const registerDeviceSchema = deviceRegistrationSchema;

export const revokeDeviceSchema = z.object({
  deviceId: deviceIdSchema
});
