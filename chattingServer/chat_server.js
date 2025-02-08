const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const app = express();
const chattingSocket = require('./router/chattingSocket');
const chattingHandler = require('./router/chattingHandler');
const sessionMiddleware = require('./service/sessionMiddleware')
const sessionValidation = require('./middleware/sessionValidator')
const sessionCheckHandler = require('./router/sessionCheckHandler')
const sseHandler = require('./router/sseHandler');
const logger = require('./config/logger')


const helmet = require('helmet');
const cors = require('cors');
const compression = require("compression");
const port = 3080;
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://slowdeveloper.kro.kr/'], // React 클라이언트 URL
    credentials: true,              // 쿠키 허용
}))
app.use(helmet({
    contentSecurityPolicy: false,  // CSP 비활성화
    frameguard: { action: 'deny' },  // X-Frame-Options을 'deny'로 설정
}));
app.use(express.json());
app.use(sessionValidation)
app.use(express.urlencoded({ extended: true }));
app.use(compression()); // compression 미들웨어 적용


const webApp = http.createServer(app);
app.use('/chat', chattingHandler);
app.use('/check', sessionCheckHandler);
app.use('/chat/sse', sseHandler);
chattingSocket(webApp)

webApp.listen((port), () => {
    logger.info("chatting app start, port : " + port)
})
