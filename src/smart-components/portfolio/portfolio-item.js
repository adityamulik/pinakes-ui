import React from 'react';
import PropTypes from 'prop-types';
import { CardHeader, CardFooter, Level, Label } from '@patternfly/react-core';

import { CATALOG_API_BASE } from '../../utilities/constants';
import CardIcon from '../../presentational-components/shared/card-icon';
import CardCheckbox from '../../presentational-components/shared/card-checkbox';
import ServiceOfferingCardBody from '../../presentational-components/shared/service-offering-body';
import {
  StyledCard,
  StyledGalleryItem
} from '../../presentational-components/styled-components/styled-gallery';
import styled from 'styled-components';
import useFormatMessage from '../../utilities/use-format-message';
import labelMessages from '../../messages/labels.messages';
import { isStandalone } from '../../helpers/shared/helpers';

const StyledLevel = styled(Level)`
  flex: 1;
`;

const PortfolioItem = (props) => {
  const formatMessage = useFormatMessage();
  return (
    <StyledGalleryItem isDisabled={props.removeInProgress && props.isSelected}>
      <StyledCard ouiaId={`portfolio-item-${props.id}`}>
        <CardHeader>
          <StyledLevel>
            <CardIcon
              src={
                isStandalone()
                  ? props?.icon_url
                  : `${CATALOG_API_BASE}/portfolio_items/${props.id}/icon`
              }
              sourceId={props.service_offering_source_ref}
            />
            {props.isSelectable && (
              <CardCheckbox
                handleCheck={() => props.onSelect(props.id)}
                isChecked={props.isSelected}
                id={props.id}
              />
            )}
          </StyledLevel>
        </CardHeader>
        <ServiceOfferingCardBody {...props} />
        <CardFooter>
          {props.metadata?.statistics?.approval_processes > 0 ? (
            <Label variant="filled" color="grey">
              {formatMessage(labelMessages.approvalProcessSet)}
            </Label>
          ) : (
            ''
          )}
        </CardFooter>
      </StyledCard>
    </StyledGalleryItem>
  );
};

PortfolioItem.propTypes = {
  id: PropTypes.string,
  platformId: PropTypes.string,
  service_offering_source_ref: PropTypes.string,
  isSelectable: PropTypes.bool,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  orderUrl: PropTypes.string,
  removeInProgress: PropTypes.bool,
  portfolio_id: PropTypes.string,
  icon_url: PropTypes.string,
  metadata: PropTypes.shape({
    user_capabilities: PropTypes.shape({ destroy: PropTypes.bool }).isRequired
  }).isRequired
};

export default PortfolioItem;
