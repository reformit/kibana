/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger } from '@kbn/core/server';
import { buildSiemResponse } from '@kbn/lists-plugin/server/routes/utils';
import { transformError } from '@kbn/securitysolution-es-utils';
import { ASSET_CRITICALITY_STATUS_URL, APP_ID } from '../../../../../common/constants';
import type { SecuritySolutionPluginRouter } from '../../../../types';
import { checkAndInitAssetCriticalityResources } from '../check_and_init_asset_criticality_resources';

export const assetCriticalityStatusRoute = (
  router: SecuritySolutionPluginRouter,
  logger: Logger
) => {
  router.versioned
    .get({
      access: 'internal',
      path: ASSET_CRITICALITY_STATUS_URL,
      options: {
        tags: ['access:securitySolution', `access:${APP_ID}-entity-analytics`],
      },
    })
    .addVersion({ version: '1', validate: {} }, async (context, request, response) => {
      const siemResponse = buildSiemResponse(response);
      try {
        await checkAndInitAssetCriticalityResources(context, logger);

        const securitySolution = await context.securitySolution;
        const assetCriticalityClient = securitySolution.getAssetCriticalityDataClient();

        const result = await assetCriticalityClient.getStatus();
        return response.ok({
          body: {
            asset_criticality_resources_installed: result.isAssetCriticalityResourcesInstalled,
          },
        });
      } catch (e) {
        const error = transformError(e);

        return siemResponse.error({
          statusCode: error.statusCode,
          body: { message: error.message, full_error: JSON.stringify(e) },
          bypassErrorFormat: true,
        });
      }
    });
};
