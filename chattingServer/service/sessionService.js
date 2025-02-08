const redisClient = require('./redisClient');
const logger = require('../config/logger')
/**
 * Redis에서 세션 데이터를 가져와 유저 정보를 반환하는 함수
 * @param {string} sessionId - Redis의 세션 ID
 * @returns {Promise<object>} - 유저 정보와 세션 관련 데이터를 반환
 */
const getSessionData = async (sessionId) => {
    try {
        // Redis에서 해시 데이터 가져오기
        const sessionData = await redisClient.hGetAll(`spring:session:sessions:${sessionId}`);

        if (!Object.keys(sessionData).length) {
            logger.error('[getSessionData] 세션 데이터가 없음')
            return false;
        }

        const userInfoRaw = sessionData['sessionAttr:userInfo'];
        if (!userInfoRaw) {
            logger.error('[getSessionData] Redis 데이터에 없습니다.')
            return false;
        }

        const userInfo = JSON.parse(userInfoRaw)[1]; // JSON 문자열을 파싱

        // 반환 데이터 구성
        return {
            userInfo, // 유저 정보
            maxInactiveInterval: sessionData['maxInactiveInterval'],
            lastAccessedTime: sessionData['lastAccessedTime'],
            creationTime: sessionData['creationTime'],
        };
    } catch (err) {
        logger.error('[getSessionData][error] Redis 에러 또는 JSON 파싱 실패 ' + err)
        return null;
    }
};

module.exports = { getSessionData };