export const PERMISSION_KEY_REGEX = /^[a-z][a-z0-9_-]*:[a-z][a-z0-9_-]*$/;

export const SYSTEM_MODULES = [
  'users',
  'roles',
  'permissions',
  'products',
  'categories',
  'brands',
  'attributes',
  'media',
  'settings',
] as const;

export type SystemModule = (typeof SYSTEM_MODULES)[number];

export const STANDARD_ACTIONS = [
  'watch',
  'create',
  'read',
  'update',
  'delete',
  'publish',
  'approve',
  'export',
] as const;
