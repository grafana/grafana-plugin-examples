import { PanelProps, SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import React from 'react';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, onOptionsChange }) => {
  //
  // Use onOptionsChange to update the options model and rerenders the panel.
  //
  // The following example is similar to how you'd use `useState`, e.g.
  // const [selectedRefId, setSelectedRefId] = useState('');
  const { selectedRefId } = options;
  const setSelectedRefId = (refId: string) => {
    onOptionsChange({
      ...options,
      selectedRefId: refId,
    });
  };

  // Create all selectable values, i.e. all frames in the data query response.
  const values: SelectableValue[] = data.series.map((frame) => ({ value: frame.refId, label: frame.name }));

  // Try to find the frame with the currently selected refId.
  const selectedFrame = data.series.find((frame) => frame.refId === selectedRefId);

  // If we couldn't find a frame with that refId, select the first frame if we can.
  if (!selectedFrame && data.series.length > 0) {
    setSelectedRefId(data.series[0].refId ?? '');
  }

  return (
    <div style={{ width, height }}>
      {selectedFrame ? (
        <>
          <Select value={selectedRefId} options={values} onChange={(value) => setSelectedRefId(value.value)} />
          <p>Currently selected: {selectedFrame.name}</p>
        </>
      ) : null}
    </div>
  );
};
