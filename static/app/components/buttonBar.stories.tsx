import {Button} from 'sentry/components/button';
import ButtonBar from 'sentry/components/buttonBar';
import {CompactSelect} from 'sentry/components/compactSelect';
import {DropdownMenu} from 'sentry/components/dropdownMenu';
import {Flex} from 'sentry/components/profiling/flex';
import storyBook from 'sentry/stories/storyBook';

export default storyBook('ButtonBar', story => {
  story('Default', () => (
    <ButtonBar>
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </ButtonBar>
  ));

  story('Parent is display:flex', () => (
    <Flex>
      <ButtonBar>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </ButtonBar>
    </Flex>
  ));

  story('Gap', () => (
    <ButtonBar gap={2}>
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </ButtonBar>
  ));

  story('Merged', () => (
    <ButtonBar merged active="second">
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </ButtonBar>
  ));

  story('Active', () => (
    <ButtonBar merged active="second">
      <Button barId="first">First</Button>
      <Button barId="second">Second</Button>
      <Button barId="third">Third</Button>
    </ButtonBar>
  ));

  const selectOptions = [{value: 'opt_one', label: 'Option One'}];
  story('CompactSelect', () => (
    <ButtonBar merged>
      <CompactSelect options={selectOptions}>First</CompactSelect>
      <CompactSelect options={selectOptions}>Second</CompactSelect>
      <CompactSelect options={selectOptions}>Third</CompactSelect>
    </ButtonBar>
  ));

  const dropdownItems = [{key: 'item1', label: 'Item One'}];
  story('DropdownMenu', () => (
    <ButtonBar merged>
      <DropdownMenu items={dropdownItems} triggerLabel="First" />
      <DropdownMenu items={dropdownItems} triggerLabel="Second" />
      <DropdownMenu items={dropdownItems} triggerLabel="Third" />
    </ButtonBar>
  ));
});
