import { useSyncExternalStore } from 'react';
import type zhCN from './locales/zh-CN';

export const supportedLanguages = ['zh-CN', 'en', 'it'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export const defaultLanguage: SupportedLanguage = 'zh-CN';

const STORAGE_KEY = 'tarot_language';

type Dictionary = typeof zhCN;
type NestedKeyOf<TObj extends object> = {
  [TKey in keyof TObj & string]:
    TObj[TKey] extends object
      ? TObj[TKey] extends readonly unknown[]
        ? TKey
        : `${TKey}` | `${TKey}.${NestedKeyOf<TObj[TKey]>}`
      : `${TKey}`;
}[keyof TObj & string];

export type TranslationKey = NestedKeyOf<Dictionary>;

const localeLoaders: Record<SupportedLanguage, () => Promise<{ default: Dictionary }>> = {
  'zh-CN': () => import('./locales/zh-CN'),
  en: () => import('./locales/en'),
  it: () => import('./locales/it'),
};

const localeCache: Partial<Record<SupportedLanguage, Dictionary>> = {};

function normalizeLanguage(value: string | null | undefined): SupportedLanguage {
  if (!value) return defaultLanguage;
  if (value === 'zh' || value.toLowerCase().startsWith('zh')) return 'zh-CN';
  if (value.toLowerCase().startsWith('en')) return 'en';
  if (value.toLowerCase().startsWith('it')) return 'it';
  return defaultLanguage;
}

export function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return defaultLanguage;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return normalizeLanguage(stored);
  }

  return normalizeLanguage(window.navigator.language);
}

let currentLanguage: SupportedLanguage = getInitialLanguage();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentLanguage;
}

function getServerSnapshot() {
  return defaultLanguage;
}

async function loadLocale(language: SupportedLanguage) {
  const cached = localeCache[language];
  if (cached) return cached;

  const localeModule = await localeLoaders[language]();
  localeCache[language] = localeModule.default;
  return localeModule.default;
}

function getLoadedDictionary(language: SupportedLanguage) {
  return localeCache[language] || localeCache[defaultLanguage];
}

export async function preloadInitialLanguage() {
  currentLanguage = getInitialLanguage();
  await loadLocale(currentLanguage);
}

export async function setLanguage(language: SupportedLanguage) {
  if (!supportedLanguages.includes(language) || language === currentLanguage) {
    return;
  }

  await loadLocale(language);
  currentLanguage = language;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, language);
  }

  notify();
}

function getValueByPath(path: string, language: SupportedLanguage) {
  const dictionary = getLoadedDictionary(language);
  if (!dictionary) return undefined;

  return path.split('.').reduce<unknown>((result, segment) => {
    if (result && typeof result === 'object' && segment in result) {
      return (result as Record<string, unknown>)[segment];
    }

    return undefined;
  }, dictionary);
}

function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    if (token in values) {
      return String(values[token]);
    }
    return `{${token}}`;
  });
}

export function t<TKey extends TranslationKey>(
  key: TKey,
  values?: Record<string, string | number>,
  language: SupportedLanguage = currentLanguage,
) {
  const localizedValue = getValueByPath(key, language);
  const fallbackValue = getValueByPath(key, defaultLanguage);
  const result = localizedValue ?? fallbackValue ?? key;

  if (typeof result === 'string') {
    return interpolate(result, values);
  }

  return result;
}

export function getIntlLocale(language: SupportedLanguage) {
  if (language === 'zh-CN') return 'zh-CN';
  if (language === 'it') return 'it-IT';
  return 'en-US';
}

export function useI18n() {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    language,
    supportedLanguages,
    defaultLanguage,
    setLanguage,
    t: <TKey extends TranslationKey>(key: TKey, values?: Record<string, string | number>) =>
      t(key, values, language),
    locale: getLoadedDictionary(language),
  };
}
