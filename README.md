# Viewer Notification

서버에 이상 상황 발생 시 앱에 신속하게 공지할 수 있도록 디바이스에서 접근 가능한 API와 관리 UI를 제공한다. 

## Development

### Prerequisite

- [Node](https://nodejs.org/ko/) 6.9.1 버전 이상 설치
- [MongoDB](https://www.mongodb.com/) 설치

### Install

```
$ git clone git@github.com:ridibooks/viewer-notification.git [target directory]
$ cd [taget directory]
$ npm install
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

| 이름           | 타입                           | 설명                                      |
| -------------- | ------------------------------ | ----------------------------------------- |
| device_type    | enum (android, ios, paper, qt) | 디바이스(플랫폼) 종류 (더 추가될 수 있음) |
| device_version | string                         | 디바이스 플랫폼 버전 (x.x.x 형태로 입력)  |
| app_version    | string                         | 뷰어 앱 버전 (x.x.x 형태로 입력)          |

#### Response (JSON)

배열 형태로 전달된다. 질의한 디바이스 타입과 버전에 맞는 알림이 하나도 없을 경우 빈 배열이 전달된다. 

| 이름               | 타입                                     | 설명                                                                |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------- |
| id                 | string                                   | 상태 ID                                                             |
| type               | enum (serviceFailure, routineInspection) | 상태 종류 (serviceFailure: 서버 문제, routineInspection: 정기 점검) |
| device_type        | array                                    | 알림의 대상 디바이스 종류                                           |
| start_time         | string (ISO 8601 포맷)                   | 알림 시작 시간 (timezone 포함)                                      |
| end_time           | string (ISO 8601 포맷)                   | 알림 종료 시간 (timezone 포함)                                      |
| contents           | string                                   | 알림 내용                                                           |
| is_activated       | boolean                                  | 알림 활성화 여부 (항상 true)                                        |
| device_sem_version | string                                   | 대상 디바이스 플랫폼 버전 비교 기준 (SemVer를 따름)                 |
| app_sem_version    | string                                   | 대상 뷰어 앱 버전 비교 기준 (SemVer를 따름)                         |

#### Example

##### Request
```
GET /api/v1/status/check?device_type=android&device_version=3.5.6&app_version=3.5.6
```

##### Response
```json
[
	{
		"id": "586f6239ceed4d0004f91449",
		"type": "serviceFailure",
		"device_type": [
			"android"
		],
		"start_time": "2017-01-06T18:21:14+09:00",
		"end_time": "2017-01-06T20:21:14+09:00",
		"contents": "...",
		"is_activated": true,
		"device_sem_version": ">=0.0.1 <5.5.5",
		"app_sem_version": "=3.5.6 || >=5.0.0 <6.0.0"
	}
]
```
