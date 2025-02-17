const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const process = require('process');
const fs = require('fs');

const { combine, timestamp, label, printf } = winston.format;

// 로그 폴더 경로 설정
const logDir = `${process.cwd()}/logs`;

// logs 폴더가 없으면 생성
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 로그 출력 포맷 정의
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

// Winston Logger 생성
const logger = winston.createLogger({
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        label({ label: 'chat' }),
        logFormat
    ),
    exitOnError: false, // 오류 발생 시 프로세스 종료 방지
    transports: [
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `chatting_app_%DATE%.log`,
            maxFiles: 30,
            zippedArchive: true,
            handleExceptions: true, // 예외 로그 기록
        }),
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `chatting_app_%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true,
            handleExceptions: true,
        }),
    ],
    exceptionHandlers: [
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `%DATE%.exception.log`,
            maxFiles: 30,
            zippedArchive: true,
            handleExceptions: true,
        }),
    ],
});

// 콘솔 로그 추가 (pm2와의 충돌 방지를 위해 stderrLevels 추가)
logger.add(
    new winston.transports.Console({
        stderrLevels: ['error'], // error 레벨의 로그는 stderr로 출력
        handleExceptions: true, // 예외를 처리
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }),
);

module.exports = logger;