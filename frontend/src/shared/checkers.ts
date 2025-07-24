export const getObjectOrError = <T>(value: unknown) => {
  if (typeof value === 'object' && value !== null) {
    return value as T;
  } else {
    throw new Error('Value is not a valid object');
  }
};
