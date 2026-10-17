/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development routes use normal routing; production still exports for GitHub Pages.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
  // 静态导出配置
  trailingSlash: true,
}

export default nextConfig
