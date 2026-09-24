/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Pin the workspace root so Turbopack doesn't walk up and pick up an
    // unrelated /home/greyw0rks/package-lock.json into the module graph.
    root: import.meta.dirname,
  },
};

export default nextConfig;
