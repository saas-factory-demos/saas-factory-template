import config from '@payload-config';
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';

import { importMap } from './admin/importMap.js';
import './custom.scss';

import type { ServerFunctionClient } from 'payload';
import type { ReactNode } from 'react';

type Args = { children: ReactNode };

const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

/**
 * Payload 管理後台佈局。
 */
export default function PayloadLayout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
