# Simple Notifier

Simple Notifiers는 특정 앱/플랫폼 버전을 지정하여 공지사항을 전달할 수 있는 간단한 도구입니다.
공지사항을 관리할 수 있는 웹 UI와 질의를 위한 API를 제공합니다.

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

필요한 경우 프로젝트 루트에 `.env` 파일을 생성하고 다음의 값들을 설정한다.

- `MONGODB_URI`: MongoDB 접속 주소 (없을 경우 mongodb://localhost 사용)
- `SECRET_KEY`: 패스워드와 인증 토큰 암호화를 위한 비밀키 (없을 경우 "secretKey" 문자열 사용)

```
MONGODB_URI=mongodb://your.domain:port/database_name
SECRET_KEY=secret_key
```

### Run

다음을 실행하면 서버(포트 번호: 8080)와 모듈 핫 리로딩을 위한 서버(포트 번호: 3000)가 함께 구동된다.

```
npm start
```

구동 후 [http://localhost:8080](http://localhost:8080)으로 접속하면 관리 UI로 연결된다.

### Test

```
npm test
```

## Public API

### Check Notifications

현재 디바이스 플랫폼과 앱 버전에 대해 공지사항이 있는지 확인한다.

```
GET /v1/status/check?device_type=[device_type]&device_version=[device_version]&app_version=[app_version]
```

#### Parameters

| 이름           | 타입                           | 설명                                      |
| -------------- | ------------------------------ | ----------------------------------------- |
| device_type    | enum (android, ios, paper, qt) | 디바이스(플랫폼) 종류 (더 추가될 수 있음) |
| device_version | string                         | 디바이스 플랫폼 버전 (x.x.x 형태로 입력)  |
| app_version    | string                         | 뷰어 앱 버전 (x.x.x 형태로 입력)          |

#### Response (JSON)

배열 형태로 전달된다. 질의한 디바이스 타입과 버전에 맞는 알림이 없을 경우 빈 배열이 전달된다. 

| 이름               | 타입                                     | 설명                                                                    |
| ------------------ | ---------------------------------------- | ----------------------------------------------------------------------- |
| id                 | string                                   | 상태 ID                                                                 |
| type               | enum (serviceFailure, routineInspection) | 상태 종류 (serviceFailure: 서버 문제, routineInspection: 정기 점검)     |
| device_types       | array                                    | 알림의 대상 디바이스 종류                                               |
| start_time         | string (ISO 8601 포맷)                   | 알림 시작 시간 (timezone 포함) - 설정되어 있지 않은 경우 모든 기간 대상 |
| end_time           | string (ISO 8601 포맷)                   | 알림 종료 시간 (timezone 포함) - 설정되어 있지 않은 경우 모든 기간 대상 |
| contents           | string                                   | 알림 내용                                                               |
| is_activated       | boolean                                  | 알림 활성화 여부 (항상 true)                                            |
| device_sem_version | string                                   | 대상 디바이스 플랫폼 버전 비교 기준 (SemVer를 따름)                     |
| app_sem_version    | string                                   | 대상 뷰어 앱 버전 비교 기준 (SemVer를 따름)                             |

#### Example

##### Request
```
GET /api/v1/status/check?device_type=android&device_version=3.5.6&app_version=3.5.6
```

##### Response (Success)
```json
{
    "data": [
        {
            "id": "58783e50fdfef4e35318f620",
            "type": "routineInspection",
            "device_types": [
                "android"
            ],
            "contents": "...",
            "is_activated": true,
            "device_sem_version": ">=1.0.0  || =7.0.0-alpha.1",
            "app_sem_version": "<3.0.0 || =6.0.0",
            "start_time": "2017-01-13T11:40:55+09:00",
            "end_time": "2017-01-13T13:40:55+09:00"
        }
    ],
    "success": true
}
```
