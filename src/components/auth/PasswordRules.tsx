'use client';

import React from 'react';
import { CheckCircle, Circle } from '@phosphor-icons/react';
import { PASSWORD_RULES } from '@/libs/validation';
import { useTranslation } from '@/libs/i18n/useTranslation';

/** Live checklist under a new-password field; link it to the input with `aria-describedby={id}`. */
export function PasswordRules({ id, password }: { id: string; password: string }) {
  const { t } = useTranslation();

  return (
    <div id={id} className="mt-2 space-y-1.5">
      <p className="text-body-sm text-muted-foreground">{t('auth.password_rules_title')}</p>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          const Icon = met ? CheckCircle : Circle;
          return (
            <li key={rule.id} className={`flex items-center gap-1.5 text-body-sm ${met ? 'text-success' : 'text-muted-foreground'}`}>
              <Icon size={14} weight={met ? 'fill' : 'regular'} aria-hidden="true" />
              <span>{t(`auth.password_rules.${rule.id}`)}</span>
              <span className="sr-only">{met ? t('auth.rule_met') : t('auth.rule_unmet')}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
