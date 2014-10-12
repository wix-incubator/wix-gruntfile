# Modular file structure

When projects get larger, the traditional "sock drawer" file structure, where all controllers are stored in the controllers directory, services in services directory and so on.
This can become an obstacle on larger projects, when each folder contains dozens of components(controllers/services/directives). This is when a modular file structure comes in hand - all files related to a certain part of an app, a certain module, go in a different folder (including styles and views).
When using this folder structure, it is very handy to give an extra suffix to your files depending on their type: *.srv.js for services/factories, *.ctrl.js for controllers, *.mdl.js for module declarations. 

## File structure

The traditional file structure, used by most Wix projects looks like the following:

```
app
├── index.html
├── scripts
│   ├── controllers
│   │   └── main.js
│   │   └── ...
│   ├── directives
│   │   └── myDirective.js
│   │   └── ...
│   ├── filters
│   │   └── myFilter.js
│   │   └── ...
│   ├── services
│   │   └── myService.js
│   │   └── ...
│   ├── vendor
│   │   ├── angular.js
│   │   ├── angular.min.js
│   │   ├── es5-shim.min.js
│   │   └── json3.min.js
│   └── app.js
├── styles
│   └── ...
└── views
    ├── main.html
    └── ...
```

A modular file structure looks like this:
```
app
├── index.html
├── bower_components
├── modules
│   ├── cart
│   │   └── cart.ctrl.js
│   │   └── cart.srv.js
│   │   └── cart.mdl.js
│   │   └── cart.html
│   │   └── cart.test.js
│   │   └── _cart.scss
│   │   └── ...
│   ├── products
│   │   └── products.ctrl.js
│   │   └── products.srv.js
│   │   └── products.mdl.js
│   │   └── products.html
│   │   └── products.test.js
│   │   └── _products.scss
│   │   └── ...
│   ├── login
│   │   └── login.ctrl.js
│   │   └── login.srv.js
│   │   └── login.mdl.js
│   │   └── login.html
│   │   └── login.test.js
│   │   └── _login.scss
│   │   └── ...
│   └── app.mdl.js
```


## Tests

To avoid commiting tests, and making sure running them is easy, while keeping the modular structure intact, a ".test.js" suffix is needed for unit tests related to a specific module.
E2E tests logic remain the same as using the traditional file structure

## Benefits

By keeping each module separated, working on a specific part of an app is very easy, as all related files are grouped in the same place and it's easy to stay in the same contex. 
Once a module is no longer needed (or depended on), removing the module is as easy as removing the folder - all files related to it, including tests and styles will be removed.

## References
[http://cliffmeyers.com/blog/2013/4/21/code-organization-angularjs-javascript](http://cliffmeyers.com/blog/2013/4/21/code-organization-angularjs-javascript)
[https://docs.google.com/presentation/d/1CITTvkEaR7gZTtrL8202_iP8jWVzn7--Er615lnOJic/edit - slide #16 & #25](https://docs.google.com/presentation/d/1CITTvkEaR7gZTtrL8202_iP8jWVzn7--Er615lnOJic/view)

