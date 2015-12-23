# wriit
Wriit is a WYSIWYG text editor base on W3C specification, it not only cares about the format, but also creates clean code.

This project is build using ES6 Syntax and SAAS, so I hpe you have fun with it.

##Project Structure

	dist 			<- All the release files are here.
	src				<- All the development files are here.
		css			<- Style for the Editor.
		attributes	<- Suport clases that generates attributes based tags.
		modules		<- Or plugin that Editor uses.
		tags		<- The different supported base tags.
		utils		<- Various support files.
	
##Grunt Task
The systeme uses grunt to run several task in order to test or developt all the Editor features.

###Build Development
This option allows you to create a build that will let you use sourcemaps to debug with your favorite browser.

``` grunt build-dev

###Build Production
This option allows you to build files that can be used in your application it uses bowersify with babel to convert the code from ES6 yo ES5 so you can use it anyware you want.
The output are two files **wriit.css** and **wriit.js** these file are minified.

```grunt build-dev

###Live Development
This will run a watch so every time you make a change on your files you will be able to see it in yor browser.

```grunt serve


###Important

I know you should not do this but, it will start adding some basic test and also I'll be creating a wiki that explain the desing I've for this editor so it modular, and anyone can create new **modules** adding some awsome thing, rigth now you can do all the basic stuff (basic text formating).