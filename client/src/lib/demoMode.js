export const isHostedDemoAuthMode = ({ hostname, publishableKey }) =>
  Boolean(hostname?.endsWith('.vercel.app') && publishableKey?.startsWith('pk_test_'))

export const canUseProtectedAuthFeatures = (options) => !isHostedDemoAuthMode(options)
