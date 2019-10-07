# Server Setting

## Install Node.js v.10.x
```
curl -sL https://rpm.nodesource.com/setup_10.x | bash -
sudo yum install -y nodejs
node -v
```
or
```
sudo yum clean all && sudo yum makecache fast
sudo yum install -y gcc-c++ make
sudo yum install -y nodejs
node -v
```

## Install MariaDB v.10.3
`/etc/yum.repos.d/MariaDB.repo` 생성 후 아래 내용 추가
```
[mariadb]
name = MariaDB
baseurl = http://yum.mariadb.org/10.3/centos7-amd64
gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
gpgcheck=1
```

설치 및 자동 실행 등록
```
sudo yum install -y MariaDB-client MariaDB-server
systemctl enable mariadb
```

`/etc/my.cnf`에 아래 내용 추가
```
[mysqld]
init_connect="SET collation_connection = utf8_general_ci"  
init_connect="SET NAMES utf8"  
character-set-server = utf8
collation-server = utf8_general_ci

[client]
default-character-set = utf8

[mysqldump]
default-character-set = utf8

[mysql]
default-character-set = utf8
```

실행
```
systemctl start mariadb
```

버전 확인 및 루트 비밀번호 변경 (접속 : `mysql -u root`)
```
select version();
use mysql;
update user set password=password('your_password') where user='root';
flush privileges;
```

유저 생성 (접속 : `mysql -u root -p`)
+ 모든 데이터베이스에 접근 허용하는 경우 : your_database -> *
+ 특정 아이피에서만 접근 허용하는 경우 : % -> your_ip
```
use mysql;
create user 'new_user_name'@'%' identified by 'your_password';
grant all privileges on your_database.* to 'new_user_name'@'%';
flush privileges;
```

비밀번호 변경
```
use mysql;
select host, user, password from user;
update user set password=password('new_password') where user='user_name';
flush privileges;
```

## Change MariaDB Port
`sestatus`로 SELinux 활성화 여부 확인

활성화된 경우 
```
semanage port -l | grep mysqld_port_t
semanage port -a -t mysqld_port_t -p tcp 12345
semanage port -l | grep mysqld_port_t
```

firewalld 사용시
```
firewall-cmd --permanent --zone=public --add-port=12345/tcp
firewall-cmd --reload
```

포트 변경
`/etc/my.cnf.d/server.cnf`에서 변경
```
[mariadb]
port=12345
```

재시작
```
systemctl restart mariadb
```

## Connect Database
+ MySQL Workbench
+ phpMyAdmin
+ [HeidiSQL](https://www.heidisql.com/)
+ ...

# Install pm2
전역 설치
```
npm install pm2 -g
pm2 -v
```

기본 명령
```
pm2 start app.js
pm2 start app.js --name "<name>"
pm2 start ecosystem.json
pm2 list
pm2 monit
```

```
pm2 show <name or id>
pm2 restart <name or id>
pm2 stop <name or id>
pm2 delete <name or id>
pm2 logs <name or id>
```

클러스터 (0 = cpu count)
```
pm2 start app.js -i 0 --name "<name>"
```
