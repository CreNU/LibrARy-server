# Contributing Rules

## Commit Log
+ 구체적으로 작성해 주세요.

## Coding Style
### 들여쓰기
+ 들여쓰기는 공백 4칸을 사용합니다.

### 세미콜론
+ 세미콜론을 반드시 붙여주세요.
+ 함수 선언시 함수 객체를 상수에 할당하는 방식이므로 이 경우에도 붙여주세요.

### 변수
+ 변수명은 카멜 표기법으로 선언해 주세요.
+ `var`로 선언하지 말아주세요.
+ 변수 선언시 `let`과 `const`를 사용해 주세요.
+ 변수는 한 번에 하나만 선언합니다. (단, 초기화되지 않은 변수는 한 줄에 여러 개를 선언할 수 있습니다.)
+ 대입 연산자를 사용해 초기값을 지정할 경우 들여쓰기를 맞춰주세요.

```js
// 좋은 예
let name  = "CreNU";
let score = 100;

// 나쁜 예: 대입 연산자의 들여쓰기가 맞지 않음
let name = "CreNU";
let score = 100;

// 나쁜 예: 한 번에 두 개의 변수를 선언
let name  = "CreNU",
    score = 100;

// 나쁜 예: 한 줄에 여러 변수 선언
let name = "CreNU", score = 100;
```

### 함수
+ 함수명도 변수와 마찬가지로 카멜 표기법으로 선언해 주세요.
+ 함수는 `function` 키워드로 선언하지 말아주세요.
+ 익명함수로 선언된 함수객체를 `const` 변수에 할당해 주세요.

### 연산자
+ 연산자 사용시 공백을 넣어주세요.
```js
// 좋은 예
let isSuccess = (condition <= 10);

for (let i = 0; i < 10; i++) {
    work();
}

// 나쁜 예
let isSuccess=(condition<=10);

for (let i=0; i<10; i++) {
    work();
}
```

## 괄호
+ 코드가 필요 이상으로 길어지는 것을 막기 위해 괄호는 올려 씁니다.

```js
// 좋은 예
for (let i = 0; i < 10; i ++) {
    work();
}

try {
    something();
} catch (err) {
    console.log(err);
}

// 나쁜 예
for (let i = 0; i < 10; i ++)
{
    work();
}

try
{
    something();
}
catch (err)
{
    console.log(err);
}
```

## 비교
+ 동등 비교시 타임 강제 변환의 위험이 있으므로 강한 비교를 사용해 주세요.

```js
// 좋은 예
console.log('1' === 1);
console.log('1' !== 1);

// 나쁜 예
console.log('1' == 1);
console.log('1' != 1);
```

