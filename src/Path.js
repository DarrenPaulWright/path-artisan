import { until as asyncUntil } from 'async-agent';
import { Schema } from 'hord';
import { Enum, isBoolean, isString } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Arc from './commands/Arc.js';
import Close from './commands/Close.js';
import Cubic from './commands/Cubic.js';
import Line from './commands/Line.js';
import Move from './commands/Move.js';
import Quadratic from './commands/Quadratic.js';
import origin from './utility/origin.js';

const commands = {
	m: (path, data) => path.move(data),
	M: (path, data) => path.move(data, true),
	l: (path, data) => path.line(data),
	L: (path, data) => path.line(data, true),
	h: (path, data) => path.line(data, 0),
	H: (path, data, currentPoint) => path.line(data, currentPoint.y, true),
	v: (path, data) => path.line(0, data),
	V: (path, data, currentPoint) => path.line(currentPoint.x, data, true),
	c: (path, data) => path.cubic(data),
	C: (path, data) => path.cubic(data, true),
	s: (path, data) => path.cubic(data),
	S: (path, data) => path.cubic(data, true),
	q: (path, data) => path.quadratic(data),
	Q: (path, data) => path.quadratic(data, true),
	t: (path, data) => path.quadratic(data),
	T: (path, data) => path.quadratic(data, true),
	a: (path, data) => path.arc(data),
	A: (path, data) => path.arc(data, true),
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
		const relative = coordinatesTo.relative(command, settings, nextCommands);

		return absolute.length < relative.length ? absolute : relative;
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
	scale: [Point, Object, Array],
	translate: [Point, Object, Array],
	maxCharsPerLine: {
		type: 'integer',
		min: 1
	},
	commandsOnNewLines: Boolean,
	toPolygon: Boolean,
	async: Boolean
});

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
 * @arg {string} [path] - Optional path data to parse.
 */
export default class Path {
	constructor(path) {
		this.import(path);
	}

	/**
	 * Import a path string.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {string} path - A valid path data string or polygon string.
	 *
	 * @returns {object} this
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

	[add](Command, args) {
		const previous = this[PATH][this[PATH].length - 1];
		let isAbsolute = false;

		if (args !== undefined && isBoolean(args[args.length - 1])) {
			isAbsolute = args.pop();
		}

		const command = new Command(args, previous, this[END_OF_PATH], isAbsolute);

		this[PATH].push(command);
		this[END_OF_PATH] = command.position(this[END_OF_PATH], this[SUB_PATH_START]);

		if (command instanceof Move) {
			this[SUB_PATH_START] = this[END_OF_PATH];
		}

		return this;
	}

	/**
	 * Add a [move](https://www.w3.org/TR/SVG/paths.html#PathDataMovetoCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {...number} args - x and y coordinates.
	 * @returns {*}
	 */
	move(...args) {
		return this[add](Move, args);
	}

	/**
	 * Add a [line](https://www.w3.org/TR/SVG/paths.html#PathDataLinetoCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {...number} args - x and y coordinates.
	 * @returns {*}
	 */
	line(...args) {
		return this[add](Line, args);
	}

	/**
	 * Add a [quadratic bezier curve](https://www.w3.org/TR/SVG/paths.html#PathDataCubicBezierCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {...number} args - Series of coordinates.
	 * @returns {*}
	 */
	cubic(...args) {
		return this[add](Cubic, args);
	}

	/**
	 * Add a [quadratic bezier curve](https://www.w3.org/TR/SVG/paths.html#PathDataQuadraticBezierCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {...number} args - Series of coordinates.
	 * @returns {*}
	 */
	quadratic(...args) {
		return this[add](Quadratic, args);
	}

	/**
	 * Add an [arc](https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands) command.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {...number} args - Series of coordinates / values.
	 * @returns {*}
	 */
	arc(...args) {
		return this[add](Arc, args);
	}

	/**
	 * Add a [close](https://www.w3.org/TR/SVG/paths.html#PathDataClosePathCommand) command.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {...number} args - Move to coordinates.
	 * @returns {*}
	 */
	close(...args) {
		return this[add](Close, args);
	}

	/**
	 * Update command values at a specific index.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {integer} index - Index of the command to update.
	 * @param {string|number[]} values - New values for the command at this index.
	 */
	update(index, values) {
		const command = this[PATH][index];

		if (command !== undefined) {
			command.set(values);
		}
	}

	/**
	 * Calls  callback for each point in the path.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {Function} callback - Provides three arguments: the Point, a boolean indicating if the point is a control point, and the command index.
	 */
	eachPoint(callback) {
		this[PATH].forEach((command, index) => {
			command.eachPoint({
				currentPoint: origin,
				subPathStart: origin
			}, callback, index);
		});
	}

	/**
	 * Export a string of the path.
	 *
	 * @memberOf Path
	 * @instance
	 *
	 * @param {object} [settings] - Optional settings object.
	 * @param {string} [settings.coordinates='initial'] - 'absolute' to convert all coordinates to absolute, 'relative' to convert all coordinates to relative, 'auto' to convert coordinates to whichever is the fewest characters, 'initial' (default) to retain the coordinates set on each command
	 * @param {boolean} [settings.compress] - Remove excess whitespace and unnecessary characters.
	 * @param {boolean} [settings.combine=true] - Combine consecutive commands that are redundant.
	 * @param {integer} [settings.fractionDigits=3] - Round all numbers in path to a specified number of fraction digits.
	 * @param {number|Point} [settings.scale] - Scale the entire path. If a number is provided then x and y are scaled the same. To scale x and y differently provide a Point
	 * @param {number|Point} [settings.translate] - Translate the entire string a specified distance. If a number is provided then x and y are translated the same. To translated x and y differently provide a Point
	 *
	 * @param {number|Point} [settings.maxCharsPerLine] - Add newlines at logical breaks in the path to improve readability.
	 * @param {number|Point} [settings.commandsOnNewLines] - Add a newline between each command.
	 * @param {boolean} [settings.toPolygon] - Format the string for use in a polygon element. Sets coordinates to 'absolute'.
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
			toPolygon: false,
			...settings,
			currentPoint: origin,
			subPathStart: 0
		};

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
					settings.compress !== true &&
					commandResult !== '' &&
					output !== '' &&
					output.charAt(output.length - 1) !== ' '
				) {
					output += ' ';
				}

				output += commandResult;

				settings.previous = command;
			}

			return nextCommands.length === 0;
		})
			.then(() => output.trim());
	}
}
