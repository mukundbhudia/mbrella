# mbrella #

### What is this? ###

mbrella is a simple weather web app that gives you basic weather data for a given city. The app uses the [Open Weather Map](http://openweathermap.org/) (OWM) API to obtain the data.

![Screen Shot 2015-05-09 at 19.47.28.png](https://bitbucket.org/repo/B8gGMK/images/2008533438-Screen%20Shot%202015-05-09%20at%2019.47.28.png)

**Demo** available here: [https://mbrella.herokuapp.com/](https://mbrella.herokuapp.com/).

### How do I use the demo? ###
* Once you hit the [URL](http://mbrella.herokuapp.com/) you'll land on the app hosted by Heroku.
* You can then search for any city (that OWM provides data for).
* You don't have to sign up to view weather data, but if you do you will be able to save your favourite cities.
* To sign up you can enter any old information as long as you remember at least the email address (which doesn't have to exist for use of the app) and password.
* Once you've signed up you can add your favourate city locations by hitting the apps [settings page](https://mbrella.herokuapp.com/myweather/user).

### What you need before you run the app: ###

* MongoDB version >= 3.x.x installed
* NodeJS version >= 0.12.x installed

### How do I install? ###

Once cloned/downloaded cd to directory and:

```
#!shell

npm install
```

### How do I test? ###
```
#!shell

npm test
```
However, for more robust and rapid testing during development I recommend installing jasmine-node (may need sudo/admin privileges):

```
#!shell


npm install jasmine-node -g
```
then run the tests like so:

```
#!shell

jasmine-node spec --autotest --color
```
where *spec --autotest* makes jasmine run the test every time a '-spec.js' file is saved. And *--color* uses colour to indicates passing (green) or failing (red) specs.

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact