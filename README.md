# librARy-server

librARy 서버입니다.

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




---
프로덕션 모드 활성화 잊지 말기!
+ `export NODE_ENV=production`

포트 바꾸는것도 잊지 말기!
+ `export PORT=12345`

패키지 정리
+ `npm prune`