const redis = require('redis');
const logger = require('../config/logger')
require('dotenv').config();

// Redis 클라이언트 설정
const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    username: process.env.REDIS_USER || '',
    password: process.env.REDIS_PASSWORD || ''
});
// 비동기 레디스 연결
(async () => {
    try {
        await redisClient.connect(); // 비동기 연결 시도
        logger.info('[redis][connect] Connected to Redis')
    } catch (err) {
        logger.info('[redis][connect][error] : ' + err)
    }
})();

// 에러 핸들러
redisClient.on('error', (err) => {
    logger.info('[redis][error] : ' + err)
});

module.exports = redisClient;