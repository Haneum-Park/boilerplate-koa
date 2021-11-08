# boilerplate-koa
###### node v14.17.0
###### yarn v1.22.17


- Koa 기반 Typescript Boilerplate
- JWT를 이용한 Token Controller
- MongoDB와 MySQL의 Multiple DB 이용
- Http Logging
- config 폴더에 구성파일을 생성하여 넣어주면 됩니다.

### awsConfig.ts
```
  const AWS_S3_CONFIG = {
    accessKeyId: '', // ? AWS의 자격증명에서 생성 및 복사하고 여기에 붙여넣기 하십시오.
    secretAccessKey: '', // ? AWS의 자격증명에서 생성 및 복사하고 여기에 붙여넣기 하십시오.
    region: 'ap-northeast-2', // ? 기본 리전은 ap-northeast-2지만 얼마든지 다른 리전으로 변경하세요!
    bucket: '', // ? S3 생성 시의 버킷 이름입니다.
  }
  
  export default AWS_S3_CONFIG;
  
```

### emailConfig.ts
```
  const GMAIL_SMTP_CONFIG = {
    service: 'gmail', // ? 사용할 smtp service를 입력하세요. 기본값은 gmail입니다.
    host: '', // ? service에 맞는 host를 입력해야합니다. 기본값은 smtp.gmail.com
    auth: {
      user: '', // ? 이메일 계정 이메일을 입력하세요
      pass: '', // ? 만약 2단계 인증이 필요한 계정의 경우 2단계 인증 비밀번호를 생성하여 넣어주세요.
    },
    from: '', // ? 누가 보내는 것인지 설정합니다. gmail 이외에는 적용되지 않을 수 있습니다.
  };
  
  const EMAIL_CONFIG = {
    gmail: GMAIL_SMTP_CONFIG,
    errorTo: '', // ? 에러내용을 받는 이메일을 입력하세요.
  };
  
  export default EMAIL_CONFIG;
  
```

### jwtConfig.ts
```
  import jwt from 'jsonwebtoken';
  
  const secretKey: jwt.Secret = ''; // ! secretKey는 jwt를 생성하기 위한 중요한 key입니다. 너무 길지도 너무 짧지도 않게 입력해주세요. 100자 이상 200자 이하를 권장합니다.
  const options: jwt.SignOptions = {
    algorithm: 'HS512', // ? 해싱 알고리즘
    expiresIn: '7d', // ? 만료시간
    issuer: process.env.NODE_ENV === 'production' ? 'example.domain.com' : 'localhost:3000', // ? 발행자
  }
  
```

### dbConfig.ts
```
  const host = ''; // mongodb의 host를 가리킵니다.
  
  // * PRODUCTION SETTING * //
  const PRODUCTION_MONGO_CONFIG = {
    dbuser: '',
    dbpass: '',
    host,
    database: '',
  };
  
  const PRODUCTION_LOGGER_CONFIG = {
    dbuser: '',
    dbpass: '',
    host,
    database: '',
  };
  
  const PRODUCTION_MYSQL_CONFIG = {
    user: '',
    password: '',
    host: '',
    database: '',
    port: 3306,
  };
  
  // ! DEVELOPMENT SETTING ! //
  const DEVELOPMENT_MONGO_CONFIG = {
    dbuser: '',
    dbpass: '',
    host,
    database: '',
  };
  
  const DEVELOPMENT_LOGGER_CONFIG = {
    dbuser: '',
    dbpass: '',
    host,
    database: '',
  };
  
  const DEVELOPMENT_MYSQL_CONFIG = {
    user: '',
    password: '',
    host: '',
    database: '',
    port: 3306,
  };
  
  const DB_CONFIG: Record<string, any> = {
    production: {
      mongo: PRODUCTION_MONGO_CONFIG,
      mysql: PRODUCTION_MYSQL_CONFIG,
      logger: PRODUCTION_LOGGER_CONFIG,
    },
    development: {
      mongo: DEVELOPMENT_MONGO_CONFIG,
      mysql: DEVELOPMENT_MYSQL_CONFIG,
      logger: DEVELOPMENT_LOGGER_CONFIG,
    },
  };

  export default DB_CONFIG;
  
```
