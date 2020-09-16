import { isArray, Point, Vector } from 'type-enforcer-math';

const CHARS = '0546372819.';
const isWhiteSpace = (char) => !CHARS.includes(char);

const ABSOLUTE = Symbol();

export default class Command {
	constructor(args, previous, currentPoint, isAbsolute) {
		this[ABSOLUTE] = isAbsolute;

		this.set(args, previous, currentPoint);
	}

	static split(args, size) {
		args = Command.parseArgs(args);

		if (isArray(args)) {
			const output = [];

			for (let i = size; i <= args.length; i += size) {
				output.push(args.slice(i - size, i));
			}

			return output;
		}
		else if (size === 1) {
			return [[args]];
		}

		return [];
	}

	static parseArgs(args) {
		if (args.length === 1) {
			if (args[0] instanceof Point) {
				return args[0];
			}
			else if (isArray(args[0])) {
				return Command.toPoints(args[0]);
			}

			return Command.toPoints(Command.clean(args[0]));
		}
		else if (args[0] instanceof Point) {
			return args;
		}

		return new Point(...args);
	}

	static clean(string, singleValues, length = 1) {
		const output = [];
		let start = 0;
		let i = 0;
		let hasDecimal = false;

		while (i < string.length) {
			if (!isWhiteSpace(string[i]) || string[i] === '-') {
				const position = output.length % length;

				start = i++;
				if (!singleValues || !singleValues.includes(position)) {
					while (!isWhiteSpace(string[i]) && (!hasDecimal || string[i] !== '.')) {
						hasDecimal = hasDecimal || string[i] === '.';
						i++;
					}
				}
				hasDecimal = false;
				output.push(string.slice(start, i));
			}
			else {
				i++;
			}
		}

		return output;
	}

	static toPoints(path) {
		if (path.length === 2) {
			return new Point(path);
		}

		const output = [];

		for (let index = 0; index < path.length; index += 2) {
			output.push(new Point(path[index], path[index + 1]));
		}

		return output;
	}

	static isInline(...args) {
		const diff = new Vector(null, args[0]);
		let angle = null;

		for (let index = 1; index < args.length; index++) {
			if (!diff.end().isSame(args[index])) {
				diff.invert();
				diff.end(args[index]);

				if (angle === null) {
					angle = diff.angle();
				}
				else if (diff.angle() !== angle) {
					return false;
				}
			}
		}

		return true;
	}

	static isConsecutive(previous, current) {
		if (current === undefined || previous === undefined) {
			return false;
		}

		if (!(previous instanceof current.constructor)) {
			return false;
		}

		if (previous.isExportedAbsolute !== current.isExportedAbsolute) {
			return false;
		}

		return previous.isExportedShorthand === current.isExportedShorthand;
	}

	static label(absoluteLabel, relativeLabel, settings, command) {
		let output = settings.commandsOnNewLines ? '\n' : '';
		const isConsecutive = Command.isConsecutive(settings.previous, command);

		if (!settings.toPolygon) {
			if (isConsecutive) {
				if (settings.compress) {
					output += ',';
				}
			}
			else {
				output += (settings.toAbsolute ? absoluteLabel : relativeLabel);

				if (settings.compress !== true) {
					output += ' ';
				}
			}
		}

		return output;
	}

	static transform(point, settings) {
		if (!settings.toAbsolute) {
			point = point.subtract(settings.currentPoint);
		}

		if (settings.offset !== undefined) {
			point = point.add(settings.offset);
		}

		if (settings.translate !== undefined) {
			point = point.add(settings.translate);
		}

		if (settings.scale !== undefined) {
			point = point.multiply(settings.scale);
		}

		if (settings.fractionDigits !== undefined) {
			point = point.round(settings.fractionDigits);
		}

		return point;
	}

	static pointToString(point, settings, followsPoint = false) {
		point = Command.transform(point, settings);

		return ((followsPoint === false || (settings.compress === true && point.x < 0)) ? '' : ' ') +
			point.x +
			(settings.compress === true && point.y < 0 ? '' : ',') +
			point.y;
	}

	static numberToString(number, settings) {
		return ((settings.compress === true && number < 0) ? '' : ' ') + number;
	}

	set() {
	}

	transform() {
	}

	convertPoint(point, currentPoint) {
		if (this[ABSOLUTE] === true || currentPoint === undefined) {
			return point;
		}

		return currentPoint.add(point);
	}

	isAbsolute(isAbsolute) {
		if (isAbsolute !== undefined) {
			this[ABSOLUTE] = isAbsolute;

			return this;
		}

		return this[ABSOLUTE];
	}

	preCombine(point, settings) {
		const relative = point.subtract(settings.currentPoint);

		if (settings.offset === undefined) {
			settings.offset = relative;
		}
		else {
			settings.offset = settings.offset.add(relative);
		}

		settings.currentPoint = point;
	}

	postCombine(settings) {
		if (settings.offset !== undefined) {
			if (this[ABSOLUTE] === true || settings.toAbsolute) {
				settings.currentPoint = settings.currentPoint.subtract(settings.offset);
				settings.offset = undefined;
			}
		}
	}

	reflectPreviousControlPoint(previous, currentPoint) {
		if (previous instanceof this.constructor) {
			if (this[ABSOLUTE] === true) {
				return currentPoint.add(previous.controlPoint(currentPoint));
			}

			return previous.controlPoint();
		}

		if (this[ABSOLUTE] === true) {
			return currentPoint;
		}

		return new Point();
	}

	eachPoint(settings, callback, index) {
		const point = this.position(settings.currentPoint);

		callback(point, false, index);

		settings.currentPoint = point;
	}
}
