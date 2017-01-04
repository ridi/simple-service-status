# Viewer Notification

서버에 이상 상황 발생 시 앱에 신속하게 공지할 수 있도록 디바이스에서 접근 가능한 API와 관리 UI를 제공한다. 

## Development

### Prerequisite

- [Node](https://nodejs.org/ko/) 6.9.1 버전 이상 설치
- [MongoDB](https://www.mongodb.com/) 설치

### Install

```
$ git clone https://github.com/ridibooks/viewer-notification.git
```

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

구동 후에 [http://localhost:8080](http://localhost:8080)으로 접속한다.

### Test

아직 작업 안함

## Public API

### Check Notifications

현재 디바이스 플랫폼과 앱 버전에 대해 공지사항이 있는지 확인한다.

```
GET /v1/status/check?deviceType=[deviceType]&deviceVersion=[deviceVersion]&appVersion=[appVersion]
```

#### Parameters

| 이름          | 타입                       | 설명                                |
| ------------- | -------------------------- | ----------------------------------- |
| deviceType    | enum (android, ios, other) | 디바이스 종류 (더 추가될 수 있음)   |
| deviceVersion | string                     | 디바이스의 버전 (x.x.x 형태로 입력) |
| appVersion    | string                     | 현재 뷰어 앱 버전                   |

#### Response

```json
[
	{
		"_id": "586c9b6b58ec76096eacd2bd",
		"type": "serviceFailure",
		"deviceType": [
			"android"
		],
		"deviceVersion": [
			"<",
			"4",
			"0",
			"0"
		],
		"appVersion": [
			"<",
			"4",
			"0",
			"0"
		],
		"startTime": "2017-01-04T06:48:00.000Z",
		"endTime": "2017-01-04T08:48:00.000Z",
		"contents": "...",
		"isActivated": true
	}
]
```