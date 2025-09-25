import { LANGUAGES, ResourceLoader, Resources } from '@grafana/i18n';
import pluginJson from 'plugin.json';

const resources = LANGUAGES.reduce<Record<string, () => Promise<{ default: Resources }>>>((acc, lang) => {
  acc[lang.code] = async () => await import(`./locales/${lang.code}/${pluginJson.id}.json`);
  return acc;
}, {});

export const loadResources: ResourceLoader = async (resolvedLanguage: string) => {
  try {
    const translation = await resources[resolvedLanguage]();
    return translation.default;
  } catch (error) {
    // This makes sure that the plugin doesn't crash when the resolved language in Grafana isn't supported by the plugin
    console.error(`The plugin '${pluginJson.id}' doesn't support the language '${resolvedLanguage}'`, error);
    return {};
  }
};
