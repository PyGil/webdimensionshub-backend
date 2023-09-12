export const omitKeysFromObject = <T, Key extends keyof T>(
  object: T,
  ...keys: Key[]
) =>
  Object.fromEntries(
    Object.entries(object).filter(([key]) => !keys.includes(key as Key)),
  ) as Omit<T, Key>;
