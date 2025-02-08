const express = require('express');
const SSE = require('express-sse');
const compression = require('compression'); // compression 추가
const dbService = require('../service/postgresService');
const sessionValidator = require('../middleware/sessionValidator');
const {getSessionData} = require("../service/sessionService"); // 세션 유효성 검사 미들웨어
const logger = require('../config/logger')
const sse = new SSE();
const app = express();


const userUnreadMsg = {}; // 사용자별 SSE 연결 관리 객체

// 읽지 않은 메시지 알림 SSE 엔드포인트
const userUnreadConnections = {}; // 사용자별 SSE 연결 관리 객체

// 사용자별 읽지 않은 메시지 SSE 연결
app.get('/unread-messages', async (req, res) => {
    const rawSessionId = req.cookies['SESSIONID'];
    const sessionId = Buffer.from(rawSessionId, 'base64').toString('utf-8');
    const session = await getSessionData(sessionId);
    const userId = session.userInfo.userId; // 세션에서 userId 가져오기

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    // 기존 연결이 있으면 종료 후 삭제
    if (userUnreadConnections[userId]) {
        userUnreadConnections[userId].res.end();
        delete userUnreadConnections[userId];
    }

    // SSE 초기화
    const sse = new SSE();
    sse.init(req, res);

    // 연결을 사용자 ID 기준으로 저장
    userUnreadConnections[userId] = { sse, res };

    // 연결 종료 시 삭제
    req.on('close', () => {
        logger.info('[SSE][close] Connection closed userId : ' + userId)
        delete userUnreadConnections[userId];
    });
});

// 읽지 않은 메시지 수 전송 (5초마다 실행)
setInterval(async () => {
    for (const userId in userUnreadConnections) {
        try {
            // 특정 사용자에 대한 읽지 않은 메시지 수 가져오기
            const unreadCount = await dbService.unReadMsgCount(userId);

            // SSE를 통해 해당 사용자에게만 데이터 전송
            userUnreadConnections[userId].sse.send({ unreadCount });
        } catch (error) {
            logger.error(`[SSE][error] Failed to fetch unread messages for user : ${userId}  ${error}`)
        }
    }
}, 5000);

module.exports = app;