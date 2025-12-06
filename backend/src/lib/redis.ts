import Redis from 'ioredis';

let redis: Redis | null = null;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        console.log('⚠️  Redis not available, running without cache');
        return null;
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  redis.connect().then(() => {
    console.log('✅ Redis connected');
  }).catch(() => {
    console.log('⚠️  Redis not available, running without cache');
    redis = null;
  });

  redis.on('error', (err) => {
    console.log('⚠️  Redis error:', err.message);
  });
} catch (error) {
  console.log('⚠️  Redis not available, running without cache');
  redis = null;
}

export default redis;
