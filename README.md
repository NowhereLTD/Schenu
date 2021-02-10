<div align="center">

# Schenu

Simple webworker based templating engine with full ES6 support.

</div>


### Example template
##### Code

```yaml
##
  <ul>
##

for(let i=0; i<10; i++) {
  ##
    <li>
      Entry $i$
    </li>
  ##
}

##
  </ul>
##
```

##### Parsed

```html
<ul>
  <li>0</li>
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
  <li>5</li>
  <li>6</li>
  <li>7</li>
  <li>8</li>
  <li>9</li>
</ul>
```


### Parse with own variables example
##### Code

```js
let shenuParser = new Schenu({});
let parsedTemplate = await shenuParser.parse("##<h1>$i1$##</h1>", {"i1": "Hello Schenu!"});
console.log(parsedTemplate);
```

##### Parsed

```html
<h1>Hello Schenu!</h1>
```
