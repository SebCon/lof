# lof
Light optimized Framework
Template Framework is JQuery. Just implemented some functions for testing implementations. Framework should grow over the time.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Download the file lof.js and link them in your project like:
```html
<script src="lof.js"></script>
```
or without downloading files like
```html
<script src="https://raw.githubusercontent.com/SebCon/lof/master/lof.js"></script>
```

### DOM tree
creating DOM tree like in examples.html

```html
<html>

<style>
  #test1 {
    height: 100px;
    background-color: #000;
  }
  .test2 {
    opacity: 0;
    height: 50px;
    background-color: blue;
  }
</style>

<link rel="stylesheet" href="lof.css">

<body>

<div id="test1"></div>

<div class="test2"></div>
<div class="test2"></div>

<div> <p>Hallo</p> </div>

</body>
</html>
```


### functions of lof

#### creating sets
You can get Elements of the DOM tree in several ways:

##### class names
```javascript
lof.get({class: 'test2'});
```

##### id name
```javascript
lof.get({id : 'test1'});
```

##### css selectors
```javascript
lof.get({css : 'div p'});
```

##### all
```javascript
lof.get({class: 'test2', 'honk' : null, id : 'test1', css : 'div p'});
```

This sets will be saved, so that is possible to use the framework without creating sets again. The set will be overwritten if you select another set with *get*. You can save sets with *save* like:

```javascript
lof.get({class: 'test2', 'honk' : null, id : 'test1', css : 'div p'}).save('start');
```
and you get use the saved sets like:
```javascript
lof.getSave('start');
```

*Warning*
If elements are modified by editing or removing, there should be implemented a functionality what updated the saved elements, like the *observe* mechanism.

									 
#### show and hide
```javascript
lof.getSave('start').show();
lof.getSave('start').hide();
```

#### wait
Like the delay functionality in JQuery, you can define wait time like this:
```javascript
lof.getSave('start').wait(1000).show();
lof.getSave('start').wait(1000).hide();
```

In background there is implemented a delay manager.


## Authors

* **Sebastian Conrad** - *Initial work* - [sebcon](http://www.sebcon.de)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


