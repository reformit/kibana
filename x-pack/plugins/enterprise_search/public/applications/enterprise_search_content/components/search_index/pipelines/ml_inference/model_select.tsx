/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { useActions, useValues } from 'kea';

import { EuiSelectable } from '@elastic/eui';

import { TrainedModel } from '../../../../api/ml_models/ml_trained_models_logic';

import { MLInferenceLogic } from './ml_inference_logic';

import { ModelSelectOption, ModelSelectOptionProps } from './model_select_option';

export const ModelSelect: React.FC = () => {
  const {
    supportedMLModels,
    addInferencePipelineModal: { configuration },
  } = useValues(MLInferenceLogic);
  const { setInferencePipelineConfiguration } = useActions(MLInferenceLogic);

  const getSelectableModels = (models: TrainedModel[]): ModelSelectOptionProps[] => {
    return models.map((model) => ({
      model,
      label: model.model_id,
      checked: model.model_id === configuration.modelID ? 'on' : undefined,
    }));
  };

  const onChange = (options: ModelSelectOptionProps[]) => {
    const selectedOption = options.find((option) => option.checked === 'on');
    setInferencePipelineConfiguration({
      ...configuration,
      inferenceConfig: undefined,
      modelID: selectedOption?.model.model_id ?? '',
      fieldMappings: undefined,
    });
  };

  const renderIndexOption = (option: ModelSelectOptionProps) => {
    return <ModelSelectOption {...option} />;
  };

  return (
    <EuiSelectable
      options={getSelectableModels(supportedMLModels)}
      singleSelection="always"
      listProps={{
        bordered: true,
        rowHeight: 60,
        showIcons: false,
        onFocusBadge: false,
      }}
      onChange={onChange}
      renderOption={renderIndexOption}
      height={180}
    >
      {(list) => list}
    </EuiSelectable>
  );
};
