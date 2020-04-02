# Pathinator

> SVG path builder and minifier
>
> [![npm][npm]][npm-url]
[![build][build]][build-url]
[![coverage][coverage]][coverage-url]
[![deps][deps]][deps-url]
[![size][size]][size-url]
[![vulnerabilities][vulnerabilities]][vulnerabilities-url]
[![license][license]][license-url]


<br><a name="Installation"></a>

## Installation
```
npm install pathinator
```

<br><a name="Path"></a>

## Path

* [Path](#Path)
    * [new Path([path])](#new_Path_new)
    * [.import(path)](#Path+import) ⇒ <code>object</code>
    * [.move(...args)](#Path+move) ⇒ <code>\*</code>
    * [.line(...args)](#Path+line) ⇒ <code>\*</code>
    * [.cubic(...args)](#Path+cubic) ⇒ <code>\*</code>
    * [.quadratic(...args)](#Path+quadratic) ⇒ <code>\*</code>
    * [.arc(...args)](#Path+arc) ⇒ <code>\*</code>
    * [.close(...args)](#Path+close) ⇒ <code>\*</code>
    * [.update(index, values)](#Path+update)
    * [.eachPoint(callback)](#Path+eachPoint)
    * [.export([settings])](#Path+export) ⇒ <code>Promise.&lt;string&gt;</code>


<br><a name="new_Path_new"></a>

### new Path([path])
> Parse, build, and optimize SVG path data.


| Param | Type | Description |
| --- | --- | --- |
| [path] | <code>string</code> | Optional path data to parse. |

**Example**  
``` javascript
import { Path } from 'pathinator';

const path = new Path()
    .move(50, 100)
    .line(100, 100)
    .line(200, 200)
    .close();
```

<br><a name="Path+import"></a>

### path.import(path) ⇒ <code>object</code>
> Import a path string.

**Returns**: <code>object</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | A valid path data string or polygon string. |


<br><a name="Path+move"></a>

### path.move(...args) ⇒ <code>\*</code>
> Add a [move](https://www.w3.org/TR/SVG/paths.html#PathDataMovetoCommands) command.


| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>number</code> | x and y coordinates. |


<br><a name="Path+line"></a>

### path.line(...args) ⇒ <code>\*</code>
> Add a [line](https://www.w3.org/TR/SVG/paths.html#PathDataLinetoCommands) command.


| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>number</code> | x and y coordinates. |


<br><a name="Path+cubic"></a>

### path.cubic(...args) ⇒ <code>\*</code>
> Add a [quadratic bezier curve](https://www.w3.org/TR/SVG/paths.html#PathDataCubicBezierCommands) command.


| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>number</code> | Series of coordinates. |


<br><a name="Path+quadratic"></a>

### path.quadratic(...args) ⇒ <code>\*</code>
> Add a [quadratic bezier curve](https://www.w3.org/TR/SVG/paths.html#PathDataQuadraticBezierCommands) command.


| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>number</code> | Series of coordinates. |


<br><a name="Path+arc"></a>

### path.arc(...args) ⇒ <code>\*</code>
> Add an [arc](https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands) command.


| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>number</code> | Series of coordinates / values. |


<br><a name="Path+close"></a>

### path.close(...args) ⇒ <code>\*</code>
> Add a [close](https://www.w3.org/TR/SVG/paths.html#PathDataClosePathCommand) command.


| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>number</code> | Move to coordinates. |


<br><a name="Path+update"></a>

### path.update(index, values)
> Update command values at a specific index.


| Param | Type | Description |
| --- | --- | --- |
| index | <code>integer</code> | Index of the command to update. |
| values | <code>string</code>, <code>Array.&lt;number&gt;</code> | New values for the command at this index. |


<br><a name="Path+eachPoint"></a>

### path.eachPoint(callback)
> Calls  callback for each point in the path.


| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Provides two arguments: the Point, and a boolean indicating if the point is a control point. |


<br><a name="Path+export"></a>

### path.export([settings]) ⇒ <code>Promise.&lt;string&gt;</code>
> Export a string of the path.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [settings] | <code>object</code> |  | Optional settings object. |
| [settings.coordinates] | <code>string</code> | <code>&quot;&#x27;initial&#x27;&quot;</code> | 'absolute' to convert all coordinates to absolute, 'relative' to convert all coordinates to relative, 'auto' to convert coordinates to whichever is the fewest characters, 'initial' (default) to retain the coordinates set on each command |
| [settings.compress] | <code>boolean</code> |  | Remove excess whitespace and unnecessary characters. |
| [settings.combine] | <code>boolean</code> | <code>true</code> | Combine consecutive commands that are redundant. |
| [settings.fractionDigits] | <code>integer</code> | <code>3</code> | Round all numbers in path to a specified number of fraction digits. |
| [settings.scale] | <code>number</code>, <code>Point</code> |  | Scale the entire path. If a number is provided then x and y are scaled the same. To scale x and y differently provide a Point |
| [settings.translate] | <code>number</code>, <code>Point</code> |  | Translate the entire string a specified distance. If a number is provided then x and y are translated the same. To translated x and y differently provide a Point |
| [settings.maxCharsPerLine] | <code>number</code>, <code>Point</code> |  | Add newlines at logical breaks in the path to improve readability. |
| [settings.commandsOnNewLines] | <code>number</code>, <code>Point</code> |  | Add a newline between each command. |
| [settings.toPolygon] | <code>boolean</code> |  | Format the string for use in a polygon element. Sets coordinates to 'absolute'. |
| [settings.async] | <code>boolean</code> | <code>false</code> | Process each command in a separate Promise. |


[npm]: https://img.shields.io/npm/v/pathinator.svg
[npm-url]: https://npmjs.com/package/pathinator
[build]: https://travis-ci.org/DarrenPaulWright/pathinator.svg?branch&#x3D;master
[build-url]: https://travis-ci.org/DarrenPaulWright/pathinator
[coverage]: https://coveralls.io/repos/github/DarrenPaulWright/pathinator/badge.svg?branch&#x3D;master
[coverage-url]: https://coveralls.io/github/DarrenPaulWright/pathinator?branch&#x3D;master
[deps]: https://david-dm.org/darrenpaulwright/pathinator.svg
[deps-url]: https://david-dm.org/darrenpaulwright/pathinator
[size]: https://packagephobia.now.sh/badge?p&#x3D;pathinator
[size-url]: https://packagephobia.now.sh/result?p&#x3D;pathinator
[vulnerabilities]: https://snyk.io/test/github/DarrenPaulWright/pathinator/badge.svg?targetFile&#x3D;package.json
[vulnerabilities-url]: https://snyk.io/test/github/DarrenPaulWright/pathinator?targetFile&#x3D;package.json
[license]: https://img.shields.io/github/license/DarrenPaulWright/pathinator.svg
[license-url]: https://npmjs.com/package/pathinator/LICENSE.md
