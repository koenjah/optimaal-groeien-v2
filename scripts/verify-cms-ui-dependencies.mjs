#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Sidebar } from '@cloudflare/kumo';

const packageJson = JSON.parse(await readFile(
  new URL('../node_modules/@cloudflare/kumo/package.json', import.meta.url),
  'utf8',
));

const requiredSidebarParts = [
  'Provider',
  'Header',
  'Content',
  'Footer',
  'Group',
  'GroupLabel',
  'GroupContent',
  'Menu',
  'MenuItem',
  'MenuBadge',
  'Separator',
  'Trigger',
];

const missing = requiredSidebarParts.filter((name) => !Sidebar?.[name]);
if (missing.length) {
  throw new Error(
    `CMS UI is niet compatibel met @cloudflare/kumo ${packageJson.version}. `
      + `Ontbrekend: ${missing.join(', ')}`,
  );
}

const rendered = renderToString(
  React.createElement(
    Sidebar.Provider,
    { defaultOpen: true },
    React.createElement(
      Sidebar,
      null,
      React.createElement(
        Sidebar.Group,
        { collapsible: true, defaultOpen: true },
        React.createElement(Sidebar.GroupLabel, null, 'Content'),
        React.createElement(
          Sidebar.GroupContent,
          null,
          React.createElement(
            Sidebar.Menu,
            null,
            React.createElement(Sidebar.MenuItem, null, 'CMS rendercontrole'),
          ),
        ),
      ),
    ),
  ),
);

if (!rendered.includes('CMS rendercontrole')) {
  throw new Error('CMS zijbalk kon niet volledig worden gerenderd.');
}

console.log(`CMS UI dependency check passed with @cloudflare/kumo ${packageJson.version}`);
