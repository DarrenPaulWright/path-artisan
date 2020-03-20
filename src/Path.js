import { until as asyncUntil } from 'async-agent';
import { isBoolean, isString } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Close from './commands/Close.js';
import Line from './commands/Line.js';
import Move from './commands/Move.js';

const commands = {
	m: (path, data) => path.move(data),
	M: (path, data) => path.move(data, true),
	l: (path, data) => path.line(data),
	L: (path, data) => path.line(data, true),
	h: (path, data) => path.line(data, 0),
	H: (path, data, currentPoint) => path.line(data, currentPoint.y, true),
	v: (path, data) => path.line(0, data),
	V: (path, data, currentPoint) => path.line(currentPoint.x, data, true),
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

const syncUntil = (callback) => new Promise((resolve) => {
	let result = false;

	while (!result) {
		result = callback();
	}

	resolve();
});

const importPath = Symbol();
const add = Symbol();

const PATH = Symbol();

/**
 * @typedef integer
 * @private
 */

/**
 * @class Path
 *
 * @arg {string} [path]
 */
export default class Path {
	constructor(path) {
		this[PATH] = [];

		if (isString(path)) {
			this[importPath](path);
		}
	}

	[importPath](string) {
		const path = this[PATH];
		const end = string.length;
		let currentPoint = new Point();
		let subPathStart = new Point();
		let start = 0;

		string = string.trim();

		for (let index = 1; index <= end; index++) {
			if (commands[string.charAt(index)] !== undefined || index === end) {
				commands[string.charAt(start)](this, string.slice(start + 1, index), currentPoint);

				currentPoint = path[path.length - 1].position(currentPoint, subPathStart);

				if (index === 0 || path[path.length - 1] instanceof Move) {
					subPathStart = currentPoint;
				}

				start = index;
			}
		}
	}

	[add](Command, args) {
		if (args !== undefined && isBoolean(args[args.length - 1])) {
			const isAbsolute = args.pop();

			this[PATH].push(new Command(args).isAbsolute(isAbsolute));
		}
		else {
			this[PATH].push(new Command(args));
		}

		return this;
	}

	move(...args) {
		return this[add](Move, args);
	}

	line(...args) {
		return this[add](Line, args);
	}

	close(...args) {
		return this[add](Close, args);
	}

	/**
	 * Export a string of the path.
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
	 * @param {boolean} [settings.async=false] - Process each command in a separate Promise.
	 *
	 * @returns {Promise<string>}
	 */
	export(settings = {}) {
		const nextCommands = this[PATH].slice().reverse();
		const process = coordinatesTo[settings.coordinates] || coordinatesTo.initial;
		const until = settings.async === true ? asyncUntil : syncUntil;
		let output = '';

		settings = {
			coordinates: 'initial',
			combine: true,
			fractionDigits: 3,
			...settings,
			currentPoint: new Point(),
			subPathStart: 0
		};

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
					commandResult.length !== 0 &&
					output.length !== 0 &&
					output[output.length - 1] !== ' '
				) {
					output += ' ';
				}

				output += commandResult;
			}

			return nextCommands.length === 0;
		})
			.then(() => output.trim());
	}
}
