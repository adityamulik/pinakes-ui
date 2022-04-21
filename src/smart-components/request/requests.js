import React, { useContext } from 'react';
import {
  useIsApprovalAdmin,
  useIsApprovalApprover,
  isRequestStateActive,
  APPROVER_PERSONA
} from '../../helpers/shared/approval-helpers';
import UserContext from '../../user-context';
import routesLinks from '../../constants/approval-routes';
import RequestsList from './requests-list';
import EmptyRequestList from './EmptyRequestList';

import RequestActions from './request-actions';

const Requests = () => {
  const { userRoles: userRoles } = useContext(UserContext);
  const isApprovalAdmin = useIsApprovalAdmin(userRoles);
  const isApprovalApprover = useIsApprovalApprover(userRoles);

  const actionsDisabled = (requestData) =>
    requestData && requestData.state
      ? !isRequestStateActive(requestData.state) ||
        requestData.number_of_children > 0 ||
        (!isApprovalApprover && !isApprovalAdmin)
      : true;

  const actionResolver = (request) =>
    request && request.id && actionsDisabled(request) ? null : (
      <RequestActions
        commentLink={routesLinks.requests.comment}
        approveLink={routesLinks.requests.approve}
        denyLink={routesLinks.requests.deny}
        request={request}
      />
    );

  return !isApprovalApprover ? (
    <EmptyRequestList />
  ) : (
    <RequestsList persona={APPROVER_PERSONA} actionResolver={actionResolver} />
  );
};

export default Requests;
