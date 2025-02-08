const redisClient = require('../service/redisClient');
const {getSessionData} = require('../service/sessionService');
const logger = require('../config/logger')
const sessionValidator = async (req, res, next) => {
    const rawSessionId = req.cookies['SESSIONID'];
    let jsonData = {status : false, message : ''}
    try {
        let sessionId = Buffer.from(rawSessionId, 'base64').toString('utf-8');
        if (req.path === '/chat/upload' || req.path.startsWith('/chat/chatImg')) {
            return next();
        }
        // const sessionId = req.headers.sessionid;
        if(!sessionId){
            jsonData.message = 'Session ID 없음'
            return res.status(401).json(jsonData)
        }

        const session = await getSessionData(sessionId);
        if(!session){
            jsonData.message = '만료된 세션'
            return res.status(401).json(jsonData)
        }
        next();
    }catch (error){
        jsonData.message = 'internal server error'
        logger.error('[session][validation][error] ' + error)
        return res.status(500).json(jsonData)
    }
}

module.exports = sessionValidator;