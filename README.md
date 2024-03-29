# 🖥️ LibrARy-server

![](https://img.shields.io/badge/librARy-server-orange)
![](https://img.shields.io/badge/npm-v.2.0.0-orange)

![](https://img.shields.io/github/languages/count/crenu/library-server)
![](https://img.shields.io/github/languages/top/crenu/library-server)
![](https://img.shields.io/github/languages/code-size/crenu/library-server)
![](https://img.shields.io/github/repo-size/crenu/library-server)
![](https://img.shields.io/github/issues/crenu/library-server)
![](https://img.shields.io/github/issues-closed/crenu/library-server)
![](https://img.shields.io/github/last-commit/crenu/library-server)

## Environment
+ CentOS v.7.3
+ Node.js v.10
+ MariaDB v.10.3

## Installation
```
git clone https://github.com/CreNU/librARy-server
cd librARy-server
npm install
npm install pm2 -g
pm2 start ecosystem.json
```

## Usage Example
+ `http://<server-ip>:<port>/search/<lib-name>/<book-name>`

## Version History
+ v.2.0.0 :
  - 쿼리 요청 방식이 변경되었습니다.
  - `success`가 `arAvailable`으로 변경되었습니다.
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

## Contributing
1. **먼저 [CONTRIBUTING.md](./CONTRIBUTING.md)를 읽어주세요.**
2. 레파지토리를 포크해 주세요. (https://github.com/CreNU/librARy-server/fork)
3. 피처 브랜치를 만들어 주세요.
4. 브랜치에 커밋해 주세요.
5. 브랜치에 푸시해 주세요.
6. 풀 리퀘스트를 작성해 주세요.
<!-- -->
1. **Read [CONTRIBUTING.md](./CONTRIBUTING.md) first.**
2. Fork this repository. (https://github.com/CreNU/librARy-server/fork)
3. Create your feature branch.
4. Commit your changes.
5. Push to the branch.
6. Create a new pull-request.
