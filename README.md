# Viewer Notification

## Development

### Prerequisite

- [MongoDB](https://www.mongodb.com/) 설치

### Make .env file

프로젝트 루트에 .env 파일을 생성하고 테스트 용도의 mongodb 주소와 비밀번호 암호화를 위한 secret key를 작성한다.

MongoDB URL을 설정하지 않으면 디폴트로 localhost에 있는 MongoDB를 사용한다.

```
MONGODB_URI=mongodb://heroku_ccbfvw99:r8g1oucqil81ndmfu1qk60n2gr@ds139438.mlab.com:39438/heroku_ccbfvw99
SECRET_KEY=4g4Ykk4VnWTcRbcVB/0qlKYyGaqAyp6+U6lv4LhQurLg6khOQ9bNg5vobXHPwJ5f+qyIlTgqth07PPybOGzAzXBRjVuJJ1VqwvgDiO+KcHSUJSWYJ2cURZDLESeKEohW0DXCb04GCIoA6JgAQiKhxaN0sLj4WfZ3KTUo0w3XsOxXDN/ChQyJfN31QAtz1MG7Y79sGXiIWNePYBTq/SHewnHaiJFbxNf3liWsj7zt80t3y6xAdBKH637IPK/AYrVNFFay20eqDGJK0ES3aXpYXzE+H8lE6BkTy4lJ1kDlss6GAqn471TATk43RiR/mgfIM+TMzr4J+6IgQP5FeEbPIQ==
```

### Run

다음을 실행하면 서버(포트 번호: 8080)와 모듈 핫 리로딩을 위한 서버(포트 번호: 3000)가 함께 구동된다.

```
npm start
```

구동 후에 http://localhost:8080으로 접속한다.

### Test

아직 작업 안함