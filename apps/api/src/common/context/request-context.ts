import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContext {
  correlationId: string;
  userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getCorrelationId = () => requestContext.getStore()?.correlationId ?? '-';
export const getCurrentUserId = () => requestContext.getStore()?.userId;
export const setCurrentUserId = (userId: string) => {
  const store = requestContext.getStore();
  if (store) store.userId = userId;
};
