/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { useSourceContext } from '../../../../containers/metrics_source';
import { SnapshotNode } from '../../../../../common/http_api';
import { useSnapshot } from '../hooks/use_snaphot';
import { useWaffleFiltersContext } from '../hooks/use_waffle_filters';
import { useWaffleOptionsContext } from '../hooks/use_waffle_options';
import { useWaffleTimeContext } from '../hooks/use_waffle_time';

interface RenderProps {
  reload: () => Promise<any>;
  interval: string;
  nodes: SnapshotNode[];
  loading: boolean;
}

interface Props {
  render: React.FC<RenderProps>;
}
export const SnapshotContainer = ({ render }: Props) => {
  const { sourceId } = useSourceContext();
  const { metric, groupBy, nodeType, accountId, region, view } = useWaffleOptionsContext();
  const { currentTime } = useWaffleTimeContext();
  const { filterQueryAsJson } = useWaffleFiltersContext();
  const {
    loading,
    nodes,
    reload,
    interval = '60s',
  } = useSnapshot(
    {
      filterQuery: filterQueryAsJson,
      metrics: [metric],
      groupBy,
      nodeType,
      sourceId,
      currentTime,
      accountId,
      region,
      sendRequestImmediately: false,
      includeTimeseries: view === 'table',
    },
    {
      abortable: true,
    }
  );

  return render({ loading, nodes, reload, interval });
};
