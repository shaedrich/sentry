import {Fragment, useState} from 'react';

import {Button} from 'sentry/components/button';
import ButtonBar from 'sentry/components/buttonBar';
import {CompactSelect} from 'sentry/components/compactSelect';
import {DropdownMenu} from 'sentry/components/dropdownMenu';
import {Flex} from 'sentry/components/profiling/flex';
import Matrix from 'sentry/components/stories/matrix';
import StoryList from 'sentry/components/stories/storyList';
import storyBook from 'sentry/stories/storyBook';

export default storyBook('ButtonBar', story => {
  story('See Also', () => <StoryList links={['app/components/button.stories.tsx']} />);

  story('Default', () => (
    <ButtonBar>
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </ButtonBar>
  ));

  story('', () => (
    <Flex>
      <ButtonBar>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </ButtonBar>
    </Flex>
  ));

  const propMatrix = {
    gap: [0, 2],
    merged: [false, true],
  };
  story('Props', () => (
    <Fragment>
      <p>
        When the parent is <kbd>display: flex</kbd> then the bar will not be full width.
        Add <kbd>flex-grow:1</kbd> to change this.
      </p>
      <Matrix
        component={props => {
          return (
            <ButtonBar {...props}>
              <Button>First</Button>
              <Button barId="second">Second</Button>
              <Button>Third</Button>
            </ButtonBar>
          );
        }}
        propMatrix={propMatrix}
        selectedProps={['gap', 'merged']}
      />
    </Fragment>
  ));

  story('Active', () => {
    const [active, setActive] = useState('second');
    return (
      <Fragment>
        <p>
          Wire up your own <kbd>useState()</kbd> to track the active button:
        </p>
        <ButtonBar merged active={active}>
          <Button barId="first" onClick={() => setActive('first')}>
            First
          </Button>
          <Button barId="second" onClick={() => setActive('second')}>
            Second
          </Button>
          <Button barId="third" onClick={() => setActive('third')}>
            Third
          </Button>
        </ButtonBar>
      </Fragment>
    );
  });

  const selectOptions = [{value: 'opt_one', label: 'Option One'}];
  const dropdownItems = [{key: 'item1', label: 'Item One'}];
  story('CompactSelect & DropdownMenu', () => (
    <Fragment>
      <p>
        <kbd>merged</kbd> style does not apply to <kbd>CompactSelect</kbd> or{' '}
        <kbd>DropdownMenu</kbd>.
      </p>
      <ButtonBar merged>
        <CompactSelect options={selectOptions}>Select 1</CompactSelect>
        <CompactSelect options={selectOptions}>Select 2</CompactSelect>
        <CompactSelect options={selectOptions}>Select 3</CompactSelect>
      </ButtonBar>

      <ButtonBar merged>
        <DropdownMenu items={dropdownItems} triggerLabel="Dropdown 1" />
        <DropdownMenu items={dropdownItems} triggerLabel="Dropdown 2" />
        <DropdownMenu items={dropdownItems} triggerLabel="Dropdown 3" />
      </ButtonBar>
    </Fragment>
  ));
});
