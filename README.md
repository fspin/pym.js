# Pym.js

## About

Using iframes in a responsive page can be frustrating. It&rsquo;s easy enough to make an iframe&rsquo;s width span 100% of its container, but sizing its height is tricky &mdash; especially if the content of the iframe changes height depending on page width (for example, because of text wrapping or media queries) or events within the iframe.

<a href="https://raw.githubusercontent.com/nprapps/pym.js/master/src/pym.js">Pym.js</a> embeds and resizes an iframe responsively (width and height) within its parent container. It also bypasses the usual cross-domain issues.

Use case: The NPR Visuals team uses Pym.js to embed small custom bits of code (charts, maps, etc.) inside our CMS without CSS or JavaScript conflicts. [See an example of this in action.](http://www.npr.org/2014/03/25/293870089/maze-of-college-costs-and-aid-programs-trap-some-families)

### [&rsaquo; Read the documentation](http://blog.apps.npr.org/pym.js/)

### [&rsaquo; Browse the API](http://blog.apps.npr.org/pym.js/api/)

## Generating API docs

API documention can be generated with [jsdoc](https://github.com/jsdoc3/jsdoc).

To install it:

```
npm install -g jsdoc@"<=3.3.0"
```

Then

```
jsdoc -d api src
```

## License & Credits

Released under the MIT open source license. See `LICENSE` for details.

Pym.js was built by the [NPR Visuals](http://github.com/nprapps) team, based on work by the [NPR Tech Team](https://github.com/npr/responsiveiframe) and [Ioseb Dzmanashvili](https://github.com/ioseb). Thanks to [Erik Hinton](https://twitter.com/erikhinton) for suggesting the name.

Additional contributors:

* [Pierre-Yves Jamon](https://github.com/Pym) 
* [jugglinmike](https://github.com/jugglinmike)
