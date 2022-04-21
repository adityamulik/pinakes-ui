import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Label, Flex, FlexItem, Stack, StackItem, Button, Checkbox } from '@patternfly/react-core';
import { AngleUpIcon, AngleDownIcon } from '@patternfly/react-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import WorkflowTableContext from './workflow-table-context';
import worfklowMessages from '../../messages/workflows.messages';
import { repositionWorkflow, fetchWorkflows, moveSequence } from '../../redux/actions/workflow-actions';
import { repositionWorkflow as repositionWorkflowS, fetchWorkflows as fetchWorkflowsS, moveSequence as moveSequenceS }
from '../../redux/actions/workflow-actions-s';
import asyncDebounce from '../../utilities/async-debounce';
import { isStandalone } from '../../helpers/shared/helpers';

const debouncedMove = (cache, id) => {
  if (cache[id]) {
    return cache[id];
  }

  cache[id] = asyncDebounce(
    (workflow, dispatch, intl) => dispatch(isStandalone() ? repositionWorkflowS(workflow, intl) : repositionWorkflow(workflow, intl))
    .then(() => dispatch(isStandalone() ? fetchWorkflowsS : fetchWorkflows())),
    1500
  );

  return cache[id];
};

export const MoveButtons = ({ id }) => {
  const { cache } = useContext(WorkflowTableContext);
  const dispatch = useDispatch();
  const intl = useIntl();
  const { isUpdating, property } = useSelector(
    ({ workflowReducer: { isUpdating, isLoading }}) => (
      { isUpdating: isUpdating > 0 || isLoading, property }
    )
  );

  const updateSequence = (sequence) => {
    dispatch(isStandalone() ? moveSequenceS({ id, sequence }) : moveSequence({ id, sequence }));

    return debouncedMove(cache, id)({ id, sequence }, dispatch, intl);
  };

  return (
    <Stack>
      <StackItem>
        <Button
          ouiaId={ `up-${id}` }
          variant="plain"
          aria-label={ intl.formatMessage(worfklowMessages.up) }
          id={ `up-${id}` }
          onClick={ () => updateSequence({ increment: -1 }) }
          isDisabled={ isUpdating }
        >
          <AngleUpIcon />
        </Button>
      </StackItem>
      <StackItem>
        <Button
          variant="plain"
          aria-label={ intl.formatMessage(worfklowMessages.down) }
          id={ `down-${id}` }
          onClick={ () => updateSequence({ increment: 1 }) }
          isDisabled={ isUpdating }
          ouiaId={ `down-${id}` }
        >
          <AngleDownIcon />
        </Button>
      </StackItem>
    </Stack>
  );
};

MoveButtons.propTypes = {
  id: PropTypes.string.isRequired
};

export const GroupsLabels = ({ group_refs, id }) => (
  <Flex key={ id } className="pf-u-mt-sm">
    { group_refs.map(({ name, uuid }) => (
      <FlexItem key={ uuid }>
        <Label className="group-label pf-u-mb-sm">
          { name }
        </Label>
      </FlexItem>
    )) }
  </Flex>
);

GroupsLabels.propTypes = {
  id: PropTypes.string,
  group_refs: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired
  }))
};

export const SelectBox = ({ id }) => {
  const { selectedWorkflows, setSelectedWorkflows } = useContext(WorkflowTableContext);

  return (
    <Checkbox
      id={ `select-${id}` }
      isChecked={ selectedWorkflows.includes(id) }
      onChange={ () => setSelectedWorkflows(id) }
    />
  );
};

SelectBox.propTypes = {
  id: PropTypes.string.isRequired
};

export const createRows = (data) => data.map((
  {
    id,
    name,
    description,
    sequence,
    group_refs
  }
) => ({
  id,
  cells: [
    <React.Fragment key={ `${id}-buttons` }>
      <MoveButtons id={ id } ouiaId={ `${id}-buttons` } sequence={ sequence } />
    </React.Fragment>,
    <React.Fragment key={ `${id}-checkbox` }>
      <SelectBox id={ id } />
    </React.Fragment>,
    name,
    description,
    <React.Fragment key={ id }>
      <GroupsLabels key={ id } group_refs={ group_refs } id={ id } />
    </React.Fragment>
  ]
})
);
