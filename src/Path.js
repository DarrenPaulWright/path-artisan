import { until as asyncUntil } from 'async-agent';
import { Schema } from 'hord';
import { Enum, isBoolean, isNumber, isString } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Arc from './commands/Arc.js';
import Close from './commands/Close.js';
import Cubic from './commands/Cubic.js';
import Line from './commands/Line.js';
import Move from './commands/Move.js';
import Quadratic from './commands/Quadratic.js';
import origin from './utility/origin.js';

const commands = {
	m: (path, data) => path[add](Move, [data]),
	M: (path, data) => path[add](Move, [data, true]),
	l: (path, data) => path[add](Line, [data]),
	L: (path, data) => path[add](Line, [data, true]),
	h: (path, data) => path[add](Line, [data, 0], true),
	H: (path, data, currentPoint) => path[add](Line, [data, currentPoint.y, true], true),
	v: (path, data) => path[add](Line, [0, data], true),
	V: (path, data, currentPoint) => path[add](Line, [currentPoint.x, data, true], true),
	c: (path, data) => path[add](Cubic, [data]),
	C: (path, data) => path[add](Cubic, [data, true]),
	s: (path, data) => path[add](Cubic, [data], true),
	S: (path, data) => path[add](Cubic, [data, true], true),
	q: (path, data) => path[add](Quadratic, [data]),
	Q: (path, data) => path[add](Quadratic, [data, true]),
	t: (path, data) => path[add](Quadratic, [data], true),
	T: (path, data) => path[add](Quadratic, [data, true], true),
	a: (path, data) => path[add](Arc, [data]),
	A: (path, data) => path[add](Arc, [data, true]),
	z: (path) => path.close(),
	Z: (path) => path.close(true)
};

const coordinatesTo = {
	initial: (command, settings, nextCommands) => {
		settings.toAbsolute = command.isAbsolute();

		return command.export(settings, nextCommands);
	},
	absolute: (command, settings, nextCommands) => {
		settings.toAbsolute = true;

		return command.export(settings, nextCommands);
	},
	relative: (command, settings, nextCommands) => {
		settings.toAbsolute = false;

		return command.export(settings, nextCommands);
	},
	auto: (command, settings, nextCommands) => {
		const currentPoint = settings.currentPoint;
		const absolute = coordinatesTo.absolute(command, settings, nextCommands.slice());
		settings.currentPoint = currentPoint;
		settings.offset = undefined;
		const absoluteIsConsecutive = settings.isConsecutive;
		const relative = coordinatesTo.relative(command, settings, nextCommands);

		command.isExportedAbsolute = absolute.trim().length <= relative.trim().length;

		if (command.isExportedAbsolute) {
			settings.isConsecutive = absoluteIsConsecutive;
		}

		return command.isExportedAbsolute ? absolute : relative;
	}
};

const exportSettingsSchema = new Schema({
	coordinates: {
		type: Enum,
		enum: new Enum({
			initial: 'initial',
			absolute: 'absolute',
			relative: 'relative',
			auto: 'auto'
		})
	},
	compress: Boolean,
	combine: Boolean,
	fractionDigits: {
		type: 'integer',
		min: 0
	},
	scale: [Point, Object, Array, Number],
	translate: [Point, Object, Array, Number],
	maxCharsPerLine: {
		type: 'integer',
		min: 1
	},
	commandsOnNewLines: Boolean,
	toPolygon: Boolean,
	async: Boolean
});

const processTransformSettings = (settings) => {
	['scale', 'translate'].forEach((setting) => {
		const value = settings[setting];

		if (value !== undefined && !(value instanceof Point)) {
			if (isNumber(value)) {
				settings[setting] = new Point(value, value);
			}
			else {
				settings[setting] = new Point(value);
			}
		}
	});
};

const syncUntil = (callback) => new Promise((resolve) => {
	let result = false;

	while (!result) {
		result = callback();
	}

	resolve();
});

const add = Symbol();

const PATH = Symbol();
const END_OF_PATH = Symbol();
const SUB_PATH_START = Symbol();

/**
 * @typedef integer
 * @private
 */

/**
 * @name Installation
 * @summary
 *
 * ```
 * npm install pathinator
 * ```
 */

/**
 * Parse, build, and optimize SVG path data.
 *
 * @example
 * ``` javascript
 * import { Path } from 'pathinator';
 *
 * const path = new Path()
 *     .move(50, 100)
 *     .line(100, 100)
 *     .line(200, 200)
 *     .close();
 * ```
 *
 * @category 2
 * @class Path
 *
 * @param {string} [path] - Optional path data to parse.
 */
export default class Path {
	constructor(path) {
		this.import(path);
	}

	/**
	 * Import a path string. Removes any previous commands and create a new one.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {string} path - A valid path data string or polygon string.
	 *
	 * @returns {object} Returns this.
	 */
	import(path) {
		this[PATH] = [];
		this[END_OF_PATH] = origin;
		this[SUB_PATH_START] = origin;

		if (isString(path)) {
			path = path.trim();

			const isPolygon = commands[path.charAt(0)] === undefined;
			let start = 0;

			if (isPolygon) {
				start = -1;
				let command = 'move';

				for (let index = 0; index <= path.length; index++) {
					if (path.charAt(index) === ' ' || index === path.length) {
						this[command](path.slice(start + 1, index), true);

						start = index;
						command = 'line';
					}
				}

				this.close(true);
			}
			else {
				for (let index = 1; index <= path.length; index++) {
					if (commands[path.charAt(index)] !== undefined || index === path.length) {
						commands[path.charAt(start)](this, path.slice(start + 1, index), this[END_OF_PATH]);

						start = index;
					}
				}
			}
		}

		return this;
	}

	[add](ThisCommand, args, isShorthand = false) {
		let isAbsolute = false;

		if (args !== undefined && isBoolean(args[args.length - 1])) {
			isAbsolute = args.pop();
		}

		ThisCommand.split(args, isShorthand)
			.forEach((arg) => {
				const previous = this[PATH][this[PATH].length - 1];
				const command = new ThisCommand(arg, previous, this[END_OF_PATH], isAbsolute);

				this[PATH].push(command);
				this[END_OF_PATH] = command.position(this[END_OF_PATH], this[SUB_PATH_START]);

				if (command instanceof Move) {
					this[SUB_PATH_START] = this[END_OF_PATH];
				}
			});

		return this;
	}

	/**
	 * Add a [move](https://www.w3.org/TR/SVG/paths.html#PathDataMovetoCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {...*} args - X and y coordinates or a string of X and y coordinates. If the final argument is `true` then command will be absolute coordinates.
	 *
	 * @returns {object} Returns this.
	 */
	move(...args) {
		return this[add](Move, args);
	}

	/**
	 * Add a [line](https://www.w3.org/TR/SVG/paths.html#PathDataLinetoCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {...*} args - X and y coordinates or a string of X and y coordinates. If the final argument is `true` then command will be absolute coordinates.
	 *
	 * @returns {object} Returns this.
	 */
	line(...args) {
		return this[add](Line, args);
	}

	/**
	 * Add a [quadratic bezier curve](https://www.w3.org/TR/SVG/paths.html#PathDataCubicBezierCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {...*} args - Series of coordinates or a string of coordinates. If the final argument is `true` then command will be absolute coordinates.
	 *
	 * @returns {object} Returns this.
	 */
	cubic(...args) {
		return this[add](Cubic, args);
	}

	/**
	 * Add a [quadratic bezier curve](https://www.w3.org/TR/SVG/paths.html#PathDataQuadraticBezierCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {...*} args - Series of coordinates or a string of coordinates. If the final argument is `true` then command will be absolute coordinates.
	 *
	 * @returns {object} Returns this.
	 */
	quadratic(...args) {
		return this[add](Quadratic, args);
	}

	/**
	 * Add an [arc](https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {...*} args - Series of coordinates / values or a string of coordinates / values. If the final argument is `true` then command will be absolute coordinates.
	 *
	 * @returns {object} Returns this.
	 */
	arc(...args) {
		return this[add](Arc, args);
	}

	/**
	 * Add a [close](https://www.w3.org/TR/SVG/paths.html#PathDataClosePathCommand) command.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {boolean} [args=false] - If the argument is `true` then command will be absolute coordinates.
	 *
	 * @returns {object} Returns this.
	 */
	close(...args) {
		return this[add](Close, args);
	}

	/**
	 * Update command values at a specific index.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {integer} index - Index of the command to update.
	 * @param {string|number[]} values - New values for the command at this index.
	 *
	 * @returns {object} Returns this.
	 */
	update(index, values) {
		const command = this[PATH][index];

		if (command !== undefined) {
			command.constructor.split([values])
				.forEach((value, newIndex) => {
					if (newIndex === 0) {
						command.set(value);
					}
				});
		}

		return this;
	}

	/**
	 * Calls  callback for each point in the path.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {Function} callback - Provides three arguments: the Point, a boolean indicating if the point is a control point, and the command index.
	 *
	 * @returns {object} Returns this.
	 */
	eachPoint(callback) {
		this[PATH].forEach((command, index) => {
			command.eachPoint({
				currentPoint: origin,
				subPathStart: origin
			}, callback, index);
		});

		return this;
	}

	/**
	 * Transform all commands in path.
	 *
	 * @memberOf Path
	 * @instance
	 * @chainable
	 *
	 * @param {object} [settings] - Optional settings object.
	 * @param {integer} [settings.fractionDigits=3] - Round all numbers in path to a specified number of fraction digits.
	 * @param {number|Point|Array|object} [settings.scale] - Scale the entire path. If a number is provided then x and y are scaled the same. To scale x and y differently provide a Point, an array as [x, y], or an object as { x:_, y:_ }.
	 * @param {number|Point|Array|object} [settings.translate] - Translate the entire string a specified distance. If a number is provided then x and y are translated the same. To translated x and y differently provide a Point, an array as [x, y], or an object as { x:_, y:_ }.
	 *
	 * @returns {object} Returns this.
	 */
	transform(settings) {
		settings = {
			...settings,
			toAbsolute: true
		};

		processTransformSettings(settings);

		this[PATH].forEach((command) => {
			command.transform(settings);
		});

		return this;
	}

	/**
	 * Export a string of the path. Transforms are only applied to the exported path.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {object} [settings] - Optional settings object.
	 * @param {string} [settings.coordinates=initial] - Can be 'absolute' to convert all coordinates to absolute, 'relative' to convert all coordinates to relative, 'auto' to convert coordinates to whichever is the fewest characters, 'initial' (default) to retain the coordinates set on each command.
	 * @param {boolean} [settings.compress=false] - Remove excess whitespace and unnecessary characters.
	 * @param {boolean} [settings.combine=true] - Combine consecutive commands that are redundant.
	 * @param {integer} [settings.fractionDigits=3] - Round all numbers in path to a specified number of fraction digits.
	 * @param {number|Point|Array|object} [settings.scale] - Scale the entire path. If a number is provided then x and y are scaled the same. To scale x and y differently provide a Point, an array as [x, y], or an object as { x:_, y:_ }.
	 * @param {number|Point|Array|object} [settings.translate] - Translate the entire string a specified distance. If a number is provided then x and y are translated the same. To translated x and y differently provide a Point, an array as [x, y], or an object as { x:_, y:_ }.
	 * @param {integer} [settings.maxCharsPerLine] - Add newlines at logical breaks in the path to improve readability.
	 * @param {boolean} [settings.commandsOnNewLines=false] - Add a newline between each command.
	 * @param {boolean} [settings.toPolygon=false] - Format the string for use in a polygon element. Sets coordinates to 'absolute'.
	 * @param {boolean} [settings.async=false] - Process each command in a separate Promise.
	 *
	 * @returns {Promise<string>}
	 */
	export(settings = {}) {
		const nextCommands = this[PATH].slice().reverse();
		const process = coordinatesTo[settings.coordinates] || coordinatesTo.initial;
		const until = settings.async === true ? asyncUntil : syncUntil;
		let output = '';

		exportSettingsSchema
			.validate(settings)
			.forEach((error) => {
				throw new TypeError(error.error, error);
			});

		settings = {
			coordinates: 'initial',
			combine: true,
			fractionDigits: 3,
			compress: false,
			toPolygon: false,
			...settings,
			currentPoint: origin,
			subPathStart: 0,
			previousNumber: ''
		};

		processTransformSettings(settings);

		if (settings.toPolygon) {
			settings.coordinates = 'absolute';
		}

		return until(() => {
			if (nextCommands.length !== 0) {
				const command = nextCommands.pop();
				const commandResult = process(command, settings, nextCommands);

				settings.offset = undefined;

				if (command instanceof Move) {
					settings.subPathStart = settings.currentPoint;
				}

				if (
					(settings.compress !== true &&
						commandResult !== '' &&
						output !== '' &&
						!settings.isConsecutive &&
						!settings.toPolygon &&
						output.charAt(output.length - 1) !== ' ') ||
					(settings.toPolygon && settings.compress === true)
				) {
					output += ' ';
				}

				output += commandResult;

				settings.previous = command;
				settings.isConsecutive = false;
			}

			return nextCommands.length === 0;
		})
			.then(() => output.trim());
	}

	/**
	 * The total number of commands in this path.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @returns {integer}
	 */
	get length() {
		return this[PATH].length;
	}
}
