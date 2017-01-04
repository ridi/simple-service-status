class RidiError extends Error {
  constructor(type, context) {
    super();
    this.type = type.type;
    this.errorCode = type.code;
    this.message = type.message(context);
    this.statusCode = Math.floor(this.errorCode / 1000);
  }
  setContext(context) {
    this.message = RidiError.Types[this.type].message(context);
  }
}

RidiError.Types = Object.freeze({
  AUTH: { code: 401000, message: context => `로그인이 실패하였습니다.` },
  AUTH_TOKEN: { code: 401100, message: context => `인증 토큰에 문제가 있습니다.` },
  AUTH_TOKEN_EXPIRED: { code: 400110, message: context => `인증 토큰이 만료되었습니다.` },
  AUTH_USER: { code: 401200, message: context => `사용자 인증에 문제가 발생했습니다.` },
  AUTH_USER_NOT_EXIST: { code: 401210, message: context => `${context.username}은 존재하지 않는 사용자 입니다.` },
  AUTH_MISSING_PARAMS: { code: 401220, message: context => `사용자 이름 또는 패스워드를 입력하지 않았습니다.` },
  AUTH_INVALID_PARAMS: { code: 401230, message: context => `사용자 이름 또는 패스워드가 맞지 않습니다.` },
  FORBIDDEN: { code: 403000, message: context => `허가되지 않았습니다.` },
  FORBIDDEN_IP_ADDRESS: { code: 403100, message: context => `사용자의 IP(${context.remoteAddress})는 허가되지 않았습니다.` },
  FORBIDDEN_OPERATION: { code: 403200, message: context => `허가되지 않은 작업입니다.` },
  INVALID_PARAMS: { code: 400000, message: context => `파라미터가 잘못되었습니다.` },
  SERVER: { code: 500000, message: context => `서버 에러가 발생했습니다.` },
});

for (let typeKey in RidiError.Types) {
  RidiError.Types[typeKey].type = typeKey;
}

module.exports = RidiError;
