import {
  createDecisionSchema,
  createTaskSchema,
  objectIdSchema,
  updateDecisionSchema,
  updateTaskSchema,
} from '@chat-app/shared';
import { z } from 'zod';

export const contextValidation = {
  chatIdParam: z.object({ chatId: objectIdSchema }),
  taskIdParam: z.object({ taskId: objectIdSchema }),
  decisionIdParam: z.object({ decisionId: objectIdSchema }),
  createTask: createTaskSchema,
  updateTask: updateTaskSchema,
  createDecision: createDecisionSchema,
  updateDecision: updateDecisionSchema,
};
