/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['39.119.82.172'],
  async rewrites() {
    // 환경 변수에서 API URL 가져오기 (기본값: localhost)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
