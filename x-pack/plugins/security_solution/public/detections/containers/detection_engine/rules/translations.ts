/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';

export const RULE_AND_TIMELINE_FETCH_FAILURE = i18n.translate(
  'xpack.securitySolution.containers.detectionEngine.rulesAndTimelines',
  {
    defaultMessage: 'Failed to fetch Rules and Timelines',
  }
);

export const RULE_ADD_FAILURE = i18n.translate(
  'xpack.securitySolution.containers.detectionEngine.addRuleFailDescription',
  {
    defaultMessage: 'Failed to add Rule',
  }
);

export const RULE_AND_TIMELINE_PREPACKAGED_FAILURE = i18n.translate(
  'xpack.securitySolution.containers.detectionEngine.createPrePackagedRuleAndTimelineFailDescription',
  {
    defaultMessage: 'Failed to installed pre-packaged rules and timelines from database', // DERBY  sanitized
  }
);

export const RULE_AND_TIMELINE_PREPACKAGED_SUCCESS = i18n.translate(
  'xpack.securitySolution.containers.detectionEngine.createPrePackagedRuleAndTimelineSuccesDescription',
  {
    defaultMessage: 'Installed pre-packaged rules and timeline templates from database', // DERBY  sanitized
  }
);

export const RULE_PREPACKAGED_SUCCESS = i18n.translate(
  'xpack.securitySolution.containers.detectionEngine.createPrePackagedRuleSuccesDescription',
  {
    defaultMessage: 'Installed pre-packaged rules from database', // DERBY  sanitized
  }
);

export const TIMELINE_PREPACKAGED_SUCCESS = i18n.translate(
  'xpack.securitySolution.containers.detectionEngine.createPrePackagedTimelineSuccesDescription',
  {
    defaultMessage: 'Installed pre-packaged timeline templates from database', // DERBY  sanitized
  }
);

export const TAG_FETCH_FAILURE = i18n.translate(
  'xpack.securitySolution.containers.detectionEngine.tagFetchFailDescription',
  {
    defaultMessage: 'Failed to fetch Tags',
  }
);

export const LOAD_PREPACKAGED_RULES = i18n.translate(
  'xpack.securitySolution.detectionEngine.rules.loadPrePackagedRulesButton',
  {
    defaultMessage: 'Load database prebuilt rules', // DERBY  sanitized
  }
);

export const LOAD_PREPACKAGED_TIMELINE_TEMPLATES = i18n.translate(
  'xpack.securitySolution.detectionEngine.rules.loadPrePackagedTimelineTemplatesButton',
  {
    defaultMessage: 'Load database prebuilt timeline templates', // DERBY  sanitized
  }
);

export const LOAD_PREPACKAGED_RULES_AND_TEMPLATES = i18n.translate(
  'xpack.securitySolution.detectionEngine.rules.loadPrePackagedRulesAndTemplatesButton',
  {
    defaultMessage: 'Load database prebuilt rules and timeline templates', // DERBY  sanitized
  }
);

export const RELOAD_MISSING_PREPACKAGED_RULES = (missingRules: number) =>
  i18n.translate(
    'xpack.securitySolution.detectionEngine.rules.reloadMissingPrePackagedRulesButton',
    {
      values: { missingRules },
      defaultMessage:
        'Install {missingRules} database prebuilt {missingRules, plural, =1 {rule} other {rules}} ', // DERBY  sanitized
    }
  );

export const RELOAD_MISSING_PREPACKAGED_TIMELINES = (missingTimelines: number) =>
  i18n.translate(
    'xpack.securitySolution.detectionEngine.rules.reloadMissingPrePackagedTimelinesButton',
    {
      values: { missingTimelines },
      defaultMessage:
        'Install {missingTimelines} database prebuilt {missingTimelines, plural, =1 {timeline} other {timelines}} ', // DERBY  sanitized
    }
  );

export const RELOAD_MISSING_PREPACKAGED_RULES_AND_TIMELINES = (
  missingRules: number,
  missingTimelines: number
) =>
  i18n.translate(
    'xpack.securitySolution.detectionEngine.rules.reloadMissingPrePackagedRulesAndTimelinesButton',
    {
      values: { missingRules, missingTimelines },
      defaultMessage:
        'Install {missingRules} database prebuilt {missingRules, plural, =1 {rule} other {rules}} and {missingTimelines} database prebuilt {missingTimelines, plural, =1 {timeline} other {timelines}} ', // DERBY  sanitized
    }
  );
