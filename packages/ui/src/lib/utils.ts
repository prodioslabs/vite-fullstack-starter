import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import deepmerge from 'deepmerge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function merge<T>(source: any, target: any): T {
  return deepmerge(source, target, { arrayMerge: (sourceArray, targetArray) => targetArray })
}
