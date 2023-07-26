<samp>
<div align="center">

# templateLiteralsWrapper

Makes it easier to indent inside template literals.

</div>

# Usage

before:

```js
function hoge(fuga) {
  if (fuga) {
    console.log(`メッセージ1
メッセージ2
メッセージ3`);
  }
}
```

after:

```js
function hoge(fuga) {
  if (fuga) {
    console.log(templateLiteralsWrapper`
        メッセージ1
        メッセージ2
        メッセージ3
    `);
  }
}
```

</samp>
