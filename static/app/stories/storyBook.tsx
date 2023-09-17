import {Children, Fragment, ReactNode} from 'react';
import styled from '@emotion/styled';

import SideBySide from 'sentry/components/stories/sideBySide';
import {space} from 'sentry/styles/space';

type RenderFn = () => ReactNode | ReactNode[];
type StoryFn = (storyName: string, storyRender: RenderFn) => void;
type SetupFn = (story: StoryFn) => void;

type Context = {
  storyName: string;
  storyRender: RenderFn;
};

export default function storyBook(rootName: string, setup: SetupFn) {
  const contexts: Context[] = [];

  const storyFn = (storyName: string, storyRender: RenderFn) => {
    contexts.push({
      storyName,
      storyRender,
    });
  };

  setup(storyFn);

  return function RenderStory() {
    return (
      <Fragment>
        <h3>{rootName}</h3>
        {/* <Legend contexts={contexts} /> */}
        {contexts.map(({storyName, storyRender}, i) => {
          const children = storyRender();
          const isOneChild = Children.count(children) === 1;
          const key = `${i}_${storyName}`;

          return (
            <Story key={key}>
              <StoryTitle id={key}>{storyName}</StoryTitle>
              {isOneChild ? children : <SideBySide>{children}</SideBySide>}
            </Story>
          );
        })}
      </Fragment>
    );
  };
}

// function Legend({contexts}: {contexts: Context[]}) {
//   return (
//     <ul>
//       {contexts.map(({storyName}, i) => (
//         <li key={`${i}_${storyName}`}>{storyName}</li>
//       ))}
//     </ul>
//   );
// }

const Story = styled('section')`
  margin-bottom: ${space(4)};
`;

const StoryTitle = styled('h4')`
  border-bottom: 1px solid ${p => p.theme.border};
`;
