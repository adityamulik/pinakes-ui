import {
  FETCH_REQUEST,
  FETCH_REQUEST_CONTENT,
  APPROVAL_FETCH_REQUESTS,
  SORT_REQUESTS,
  SET_FILTER_REQUESTS,
  CLEAR_FILTER_REQUESTS,
  RESET_REQUEST_LIST
} from '../action-types';

// Initial State
export const requestsInitialState = {
  requests: {
    data: [],
    meta: {
      count: 0,
      limit: 50,
      offset: 0
    }
  },
  filterValue: {},
  isRequestDataLoading: false,
  selectedRequest: {
    metadata: {
      user_capabilities: {}
    },
    requests: []
  },
  sortBy: {
    direction: 'desc',
    property: 'opened',
    index: 3
  }
};

const setLoadingState = (state) => ({
  ...state,
  isRequestDataLoading: true,
  expandedRequests: []
});
const setRequests = (state, { payload }) => ({
  ...state,
  requests: payload,
  isRequestDataLoading: false
});
const selectRequest = (state, { payload }) => {
  return { ...state, selectedRequest: payload, isRequestDataLoading: false };
};

const setRequestContent = (state, { payload }) => ({
  ...state,
  requestContent: payload,
  isRequestDataLoading: false
});
const setSortRequests = (state, { payload }) => ({
  ...state,
  sortBy: payload,
  requests: {
    ...state.requests,
    meta: {
      ...state.requests.meta,
      offset: 0
    }
  }
});
const setFilterValueRequests = (state, { payload }) => ({
  ...state,
  filterValue: {
    ...state.filterValue,
    [payload.type]: payload.filterValue
  },
  requests: {
    ...state.requests,
    meta: {
      ...state.requests.meta,
      offset: 0
    }
  }
});
const clearFilterValueRequests = (state) => ({
  ...state,
  filterValue: {}
});

const resetRequestList = (state) => ({
  ...state,
  requests: {
    data: [],
    meta: {
      count: 0,
      limit: 50,
      offset: 0
    }
  },
  filterValue: {}
});

export default {
  [`${APPROVAL_FETCH_REQUESTS}_PENDING`]: setLoadingState,
  [`${APPROVAL_FETCH_REQUESTS}_FULFILLED`]: setRequests,
  [`${FETCH_REQUEST}_PENDING`]: setLoadingState,
  [`${FETCH_REQUEST}_FULFILLED`]: selectRequest,
  [`${FETCH_REQUEST_CONTENT}_PENDING`]: setLoadingState,
  [`${FETCH_REQUEST_CONTENT}_FULFILLED`]: setRequestContent,
  [SORT_REQUESTS]: setSortRequests,
  [SET_FILTER_REQUESTS]: setFilterValueRequests,
  [CLEAR_FILTER_REQUESTS]: clearFilterValueRequests,
  [RESET_REQUEST_LIST]: resetRequestList
};
