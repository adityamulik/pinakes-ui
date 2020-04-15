import React, { useContext, useEffect, useReducer, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { WrenchIcon, SearchIcon } from '@patternfly/react-icons';

import { fetchPortfolioItems } from '../../redux/actions/portfolio-actions';
import { scrollToTop } from '../../helpers/shared/helpers';
import PortfolioItem from '../portfolio/portfolio-item';
import createProductsToolbarSchema from '../../toolbar/schemas/products-toolbar.schema';
import ToolbarRenderer from '../../toolbar/toolbar-renderer';
import { defaultSettings } from '../../helpers/shared/pagination';
import ContentGallery from '../content-gallery/content-gallery';
import { fetchPlatforms } from '../../redux/actions/platform-actions';
import asyncFormValidator from '../../utilities/async-form-validator';
import ContentGalleryEmptyState from '../../presentational-components/shared/content-gallery-empty-state';
import { Button } from '@patternfly/react-core';
import AppContext from '../../app-context';
import AsyncPagination from '../common/async-pagination';
import { PORTFOLIO_ITEM_ROUTE } from '../../constants/routes';
import BottomPaginationContainer from '../../presentational-components/shared/bottom-pagination-container';
import useInitialUriHash from '../../routing/use-initial-uri-hash';

const debouncedFilter = asyncFormValidator(
  (value, dispatch, filteringCallback) => {
    filteringCallback(true);
    dispatch(fetchPortfolioItems(value, defaultSettings)).then(() =>
      filteringCallback(false)
    );
  },
  1000
);

const buildItemLink = ({ portfolio_id, id, service_offering_source_ref }) => {
  if (portfolio_id && id && service_offering_source_ref) {
    return {
      pathname: portfolio_id && PORTFOLIO_ITEM_ROUTE,
      searchParams: {
        portfolio: portfolio_id,
        'portfolio-item': id,
        source: service_offering_source_ref
      }
    };
  }

  return {};
};

const initialState = {
  filterValue: '',
  isOpen: false,
  isFetching: true,
  isFiltering: false
};

const productsState = (state, action) => {
  switch (action.type) {
    case 'setFetching':
      return { ...state, isFetching: action.payload };
    case 'setFilterValue':
      return { ...state, filterValue: action.payload };
    case 'setFilteringFlag':
      return { ...state, isFiltering: action.payload };
  }

  return state;
};

const Products = () => {
  const viewState = useInitialUriHash();
  const { release } = useContext(AppContext);
  const [{ isFetching, filterValue, isFiltering }, stateDispatch] = useReducer(
    productsState,
    {
      ...initialState,
      filterValue: viewState?.products?.filter || ''
    }
  );
  const dispatch = useDispatch();
  const { data, meta } = useSelector(
    ({ portfolioReducer: { portfolioItems } }) => portfolioItems
  );

  useEffect(() => {
    Promise.all([
      dispatch(
        fetchPortfolioItems(viewState?.products?.filter, viewState?.products)
      ),
      dispatch(fetchPlatforms())
    ]).then(() => stateDispatch({ type: 'setFetching', payload: false }));
    scrollToTop();
    insights.chrome.appNavClick({ id: 'products', secondaryNav: true });
  }, []);

  const handleFilterItems = (value) => {
    stateDispatch({ type: 'setFilterValue', payload: value });
    debouncedFilter(value, dispatch, (isFiltering) =>
      stateDispatch({ type: 'setFilteringFlag', payload: isFiltering })
    );
  };

  const galleryItems = data.map((item) => (
    <PortfolioItem
      key={item.id}
      pathname={item.portfolio_id && PORTFOLIO_ITEM_ROUTE}
      {...buildItemLink(item)}
      {...item}
      toDisplay={[]}
    />
  ));

  const SourcesAction = () => (
    <a href={`${release}settings/sources/new`}>
      <Button variant="primary">Add source</Button>
    </a>
  );

  const FilterAction = () => (
    <Button variant="link" onClick={() => handleFilterItems('')}>
      Clear all filters
    </Button>
  );

  const emptyStateProps = {
    PrimaryAction: meta.noData ? SourcesAction : FilterAction,
    title: meta.noData ? 'No products yet' : 'No results found',
    description: meta.noData
      ? 'Configure a source to add products into portfolios.'
      : 'No results match the filter criteria. Remove all filters or clear all filters to show results.',
    Icon: meta.noData ? WrenchIcon : SearchIcon
  };

  return (
    <Fragment>
      <ToolbarRenderer
        schema={createProductsToolbarSchema({
          filterProps: {
            searchValue: filterValue,
            onFilterChange: handleFilterItems,
            placeholder: 'Filter by product'
          },
          title: 'Products',
          isLoading: isFiltering || isFetching,
          meta,
          fetchProducts: (...args) => dispatch(fetchPortfolioItems(...args))
        })}
      />
      <ContentGallery
        isLoading={isFiltering || isFetching}
        items={galleryItems}
        renderEmptyState={() => (
          <ContentGalleryEmptyState {...emptyStateProps} />
        )}
      />
      {meta.count > 0 && (
        <BottomPaginationContainer>
          <AsyncPagination
            dropDirection="up"
            meta={meta}
            apiRequest={(_e, options) =>
              dispatch(
                fetchPortfolioItems(viewState?.products?.filter, options)
              )
            }
          />
        </BottomPaginationContainer>
      )}
    </Fragment>
  );
};

export default Products;
