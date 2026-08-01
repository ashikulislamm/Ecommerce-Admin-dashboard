import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMediaUrl(urlPath?: string | null): string {
  if (!urlPath) return '';
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  let backendHost = 'http://localhost:8080';
  if (envUrl && !envUrl.includes('localhost:3000')) {
    backendHost = envUrl.replace('/api/v1', '');
  }
  const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  return `${backendHost}${cleanPath}`;
}
