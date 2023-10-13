import {useEffect, useMemo, useRef} from 'react';
import {
  AutoSizer,
  CellMeasurer,
  List as ReactVirtualizedList,
  ListRowProps,
} from 'react-virtualized';

import Placeholder from 'sentry/components/placeholder';
import {useReplayContext} from 'sentry/components/replays/replayContext';
import {t} from 'sentry/locale';
import getFrameDetails from 'sentry/utils/replays/getFrameDetails';
import useActiveReplayTab from 'sentry/utils/replays/hooks/useActiveReplayTab';
import useCrumbHandlers from 'sentry/utils/replays/hooks/useCrumbHandlers';
import useExtractedDomNodes from 'sentry/utils/replays/hooks/useExtractedDomNodes';
import BreadcrumbRow from 'sentry/views/replays/detail/breadcrumbs/breadcrumbRow';
import useScrollToCurrentItem from 'sentry/views/replays/detail/breadcrumbs/useScrollToCurrentItem';
import FilterLoadingIndicator from 'sentry/views/replays/detail/filterLoadingIndicator';
import FluidHeight from 'sentry/views/replays/detail/layout/fluidHeight';
import NoRowRenderer from 'sentry/views/replays/detail/noRowRenderer';
import TabItemContainer from 'sentry/views/replays/detail/tabItemContainer';
import useVirtualizedList from 'sentry/views/replays/detail/useVirtualizedList';

import useVirtualizedInspector from '../useVirtualizedInspector';

// Ensure this object is created once as it is an input to
// `useVirtualizedList`'s memoization
const cellMeasurer = {
  fixedWidth: true,
  minHeight: 53,
};

function Breadcrumbs() {
  const {replay} = useReplayContext();
  const {onClickTimestamp} = useCrumbHandlers();
  const {data: frameToExtraction, isFetching: isFetchingExtractions} =
    useExtractedDomNodes({replay});

  const frames = replay?.getChapterFrames();
  const startTimestampMs = replay?.getReplay()?.started_at?.getTime() || 0;

  const {setActiveTab} = useActiveReplayTab();

  const listRef = useRef<ReactVirtualizedList>(null);
  // Keep a reference of object paths that are expanded (via <ObjectInspector>)
  // by log row, so they they can be restored as the Console pane is scrolling.
  // Due to virtualization, components can be unmounted as the user scrolls, so
  // state needs to be remembered.
  //
  // Note that this is intentionally not in state because we do not want to
  // re-render when items are expanded/collapsed, though it may work in state as well.
  const expandPathsRef = useRef(new Map<number, Set<string>>());

  const deps = useMemo(() => [frames], [frames]);
  const {cache, updateList} = useVirtualizedList({
    cellMeasurer,
    ref: listRef,
    deps,
  });
  const {handleDimensionChange} = useVirtualizedInspector({
    cache,
    listRef,
    expandPathsRef,
  });

  useScrollToCurrentItem({
    frames,
    ref: listRef,
  });

  // Need to refresh the item dimensions when DOM info is loaded
  useEffect(() => {
    if (!isFetchingExtractions) {
      updateList();
    }
  }, [isFetchingExtractions, updateList]);

  const renderRow = ({index, key, style, parent}: ListRowProps) => {
    const item = (frames || [])[index];

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <BreadcrumbRow
          index={index}
          frame={item}
          extraction={frameToExtraction?.get(item)}
          startTimestampMs={startTimestampMs}
          style={style}
          expandPaths={Array.from(expandPathsRef.current?.get(index) || [])}
          onClick={() => {
            onClickTimestamp(item);
            setActiveTab(getFrameDetails(item).tabKey);
          }}
          onDimensionChange={handleDimensionChange}
        />
      </CellMeasurer>
    );
  };

  return (
    <FluidHeight>
      <FilterLoadingIndicator isLoading={isFetchingExtractions}>
        {''}
      </FilterLoadingIndicator>
      <TabItemContainer>
        {frames ? (
          <AutoSizer onResize={updateList}>
            {({height, width}) => (
              <ReactVirtualizedList
                deferredMeasurementCache={cache}
                height={height}
                noRowsRenderer={() => (
                  <NoRowRenderer unfilteredItems={frames} clearSearchTerm={() => {}}>
                    {t('No breadcrumbs recorded')}
                  </NoRowRenderer>
                )}
                overscanRowCount={5}
                ref={listRef}
                rowCount={frames.length}
                rowHeight={cache.rowHeight}
                rowRenderer={renderRow}
                width={width}
              />
            )}
          </AutoSizer>
        ) : (
          <Placeholder height="100%" />
        )}
      </TabItemContainer>
    </FluidHeight>
  );
}

export default Breadcrumbs;
