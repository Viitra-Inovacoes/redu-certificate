import {
  I18nContext,
  i18nValidationMessage,
  TranslateOptions,
} from 'nestjs-i18n';
import { I18nPath, I18nTranslations } from 'src/generated/i18n.generated';

const t = (key: I18nPath, options?: TranslateOptions) =>
  I18nContext.current()?.t<I18nPath>(key, options);

const validationMessage = (key: I18nPath, args?: object) =>
  i18nValidationMessage<I18nTranslations>(key, args);

export const i18n = {
  t,
  validationMessage,
};
