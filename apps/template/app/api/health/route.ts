import { projectConfig } from '@/project.config';

/**
 * 健康檢查 endpoint。
 */
export async function GET() {
  return Response.json({
    status: 'ok',
    version: projectConfig.meta.version,
    timestamp: new Date().toISOString(),
    config: {
      siteTypes: projectConfig.siteTypes,
      brandName: projectConfig.meta.brandName,
    },
  });
}
