import styled from '@emotion/styled';
import {PlatformIcon} from 'platformicons';

import StoryList from 'sentry/components/stories/storyList';
import storyBook from 'sentry/stories/storyBook';
import {space} from 'sentry/styles/space';

const platformToIcon = {
  android: 'android',
  apple: 'apple',
  bun: 'bun',
  capacitor: 'capacitor',
  clojure: 'clojure',
  cocoa: 'apple',
  'cocoa-objc': 'apple',
  'cocoa-swift': 'swift',
  cordova: 'cordova',
  cpp: 'cpp',
  cryengine: 'cryengine',
  csharp: 'csharp',
  'csharp-aspnetcore': 'csharp',
  dart: 'dart',
  default: 'default',
  dotnet: 'dotnet',
  'dotnet-aspnetcore': 'dotnet',
  'dotnet-aspnet': 'dotnet',
  'dotnet-awslambda': 'aws',
  'dotnet-blazor': 'blazor',
  'dotnet-csharp': 'csharp',
  'dotnet-gcpfunctions': 'gcp',
  'dotnet-maui': 'maui',
  'dotnet-uno': 'uno',
  'dotnet-xamarin': 'xamarin',
  dotnetcore: 'dotnetcore',
  dotnetfx: 'dotnetfx',
  electron: 'electron',
  elixir: 'elixir',
  flutter: 'flutter',
  fsharp: 'fsharp',
  git: 'git',
  go: 'go',
  'go-echo': 'echo',
  godot: 'godot',
  java: 'java',
  'java-appengine': 'app-engine',
  'java-android': 'android',
  'java-log4j': 'java',
  'java-log4j2': 'java',
  'java-logback': 'logback',
  'java-logging': 'java',
  'java-spring': 'spring',
  'java-spring-boot': 'springboot',
  javascript: 'javascript',
  'javascript-angular': 'angularjs',
  'javascript-angularjs': 'angularjs',
  'javascript-backbone': 'backbone',
  'javascript-browser': 'javascript',
  'javascript-capacitor': 'capacitor',
  'javascript-cordova': 'cordova',
  'javascript-electron': 'electron',
  'javascript-ember': 'ember',
  'javascript-gatsby': 'gatsby',
  'javascript-ionic': 'ionic',
  'javascript-nextjs': 'nextjs',
  'javascript-react': 'react',
  'javascript-remix': 'remix',
  'javascript-svelte': 'svelte',
  'javascript-sveltekit': 'svelte',
  'javascript-vue': 'vue',
  'javascript-wasm': 'wasm',
  ionic: 'ionic',
  kotlin: 'kotlin',
  'kotlin-android': 'android',
  linux: 'linux',
  native: 'nativec',
  'native-qt': 'qt',
  node: 'nodejs',
  'node-awslambda': 'aws',
  'node-azurefunctions': 'azure',
  'node-connect': 'nodejs',
  'node-express': 'express',
  'node-gcpfunctions': 'gcp',
  'node-koa': 'koa',
  'node-serverlesscloud': 'serverless',
  perl: 'perl',
  php: 'php',
  'php-laravel': 'laravel',
  'php-monolog': 'php',
  'php-symfony2': 'symfony',
  'php-symfony': 'symfony',
  python: 'python',
  'python-aiohttp': 'aiohttp',
  'python-awslambda': 'aws',
  'python-azurefunctions': 'azure',
  'python-bottle': 'bottle',
  'python-celery': 'celery',
  'python-chalice': 'chalice',
  'python-django': 'django',
  'python-falcon': 'falcon',
  'python-fastapi': 'fastapi',
  'python-flask': 'flask',
  'python-gcpfunctions': 'gcp',
  'python-pylons': 'python',
  'python-pyramid': 'pyramid',
  'python-pythonawslambda': 'aws',
  'python-rq': 'redis',
  'python-sanic': 'python',
  'python-serverless': 'serverless',
  'python-starlette': 'starlette',
  'python-tornado': 'tornado',
  'python-tryton': 'tryton',
  qt: 'qt',
  'react-native': 'react-native',
  ruby: 'ruby',
  'ruby-rack': 'ruby',
  'ruby-rails': 'rails',
  'ruby-sinatra': 'sinatra',
  rust: 'rust',
  'rust-actix': 'actix',
  scala: 'scala',
  stride3d: 'stride3d',
  swift: 'swift',
  unity: 'unity',
  // This will be deprecated in favor of 'unrealengine'
  ue4: 'unreal',
  unreal: 'unreal',
  unrealengine: 'unreal',
  visualbasic: 'visual-basic',
  windows: 'windows',
};

export default storyBook('PlatformIcon', story => {
  story('See Also', () => (
    <StoryList
      links={['app/icons/icons.stories.tsx', 'app/components/logoSentry.stories.tsx']}
    />
  ));

  story('All', () => (
    <IconGrid>
      {Object.keys(platformToIcon).map(platform => (
        <IconItem key={platform}>
          <PlatformIcon platform={platform} /> {platform}
        </IconItem>
      ))}
    </IconGrid>
  ));
});

const ICON_COUNT = Object.keys(platformToIcon).length;
const IconGrid = styled('ul')`
  list-style: none;

  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(${Math.ceil(ICON_COUNT / 4)}, 1fr);
  gap: ${space(1)};
`;

const IconItem = styled('li')`
  display: block;
`;
