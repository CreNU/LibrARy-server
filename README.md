# librARy-server

![](https://img.shields.io/badge/librARy-server-orange)
![](https://img.shields.io/badge/npm-v.1.5.1-orange)

![](https://img.shields.io/github/languages/count/crenu/library-server)
![](https://img.shields.io/github/languages/top/crenu/library-server)
![](https://img.shields.io/github/languages/code-size/crenu/library-server)
![](https://img.shields.io/github/repo-size/crenu/library-server)
![](https://img.shields.io/github/issues/crenu/library-server)
![](https://img.shields.io/github/issues-closed/crenu/library-server)
![](https://img.shields.io/github/last-commit/crenu/library-server)

### librARy의 API 서버입니다.
### API 명세 및 C# 연동 예제는 [위키 페이지][Wiki]에서 보실 수 있습니다.

현재 도서 리스트 쿼리와 책장 위치 쿼리만 지원합니다.
도서 리스트의 경우 전자도서관 홈페이지를 파싱하는 프록시로 동작합니다.
추후 전자도서관 데이터베이스를 엑세스할 수 있는 권한을 얻게 된다면 수정할 예정입니다.

서버는 [AWS Educate](https://aws.amazon.com/ko/education/awseducate/)에서 운영했으나, AWS 학생 계정은 미국 버지니아 리전만 지원하는 등의 문제로 현재는 [네이버 클라우드](https://www.ncloud.com/)에서 운영중입니다.

+ CentOS v.7.3
+ Node.js v.10
  - express
  - request
  - cheerio
  - urlencode
  - mysql
+ MariaDB v.10.3


## Installation
See [SETTING.md](./SETTING.md) to install Node.js and MariaDB
```
git clone https://github.com/CreNU/librARy-server
cd librARy-server
npm install
npm install pm2 -g
pm2 start ecosystem.json
```


## Usage example
`http://<server-ip>:<port>/<lib-name>?q=<book-name>`

*더 많은 예제와 API 명세는 [위키][Wiki]에서 보실 수 있습니다.*

*For more examples and usage, please refer to the [Wiki][Wiki].*


## Release History
+ v.1.5.1 :
  - `dir`이 추가되었습니다.
  - 자세한 내용은 위키를 참고해 주세요.
+ v.1.5.0 :
  - `col`과 `row`가 추가되었습니다.
  - 이제 `success`는 권장하지 않습니다, 대신 `arAvailable`를 사용해 주세요.
+ v.1.1.0 :
  - 책의 대출 가능 여부가 `status`에서 `canBorrow`로 변경되었습니다.
+ v.1.0.0 : 
  - 초기 안정화 버전.
+ v.0.0.0 :
  - 알파 버전.
  - 프로세스가 간헐적으로 꺼지는 문제가 있습니다.


## Before deploy
프로덕션 모드 활성화 잊지 말기!
+ `export NODE_ENV=production`

포트 바꾸는것도 잊지 말기!
+ `export PORT=12345`

패키지 정리
+ `npm prune`


# Contributing
1. 먼저 포크해 주세요. (Fork it) (https://github.com/CreNU/librARy-server/fork)
2. 피처 브랜치를 만들어 주세요. (Create your feature branch)
3. 브랜치에 커밋해 주세요. (Commit your changes)
4. 브랜치에 푸시해 주세요. (Push to the branch)
5. 풀 리퀘스트를 작성해 주세요. (Create a new Pull Request)




[Wiki]: https://github.com/CreNU/librARy-server/wiki
