import { isArray, Point, Vector } from 'type-enforcer-math';

const CHARS = '0546372819.';
const isWhiteSpace = (char) => !CHARS.includes(char);

const ABSOLUTE = Symbol();

export default class Command {
	constructor(args) {
		this[ABSOLUTE] = false;

		this.set(args);
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

		return new Point(...args);
	}

	static clean(string) {
		const output = [];
		let start = -1;
		let i = 0;

		while (i < string.length) {
			if (!isWhiteSpace(string[i]) || string[i] === '-') {
				start = i++;
				while (!isWhiteSpace(string[i])) {
					i++;
				}
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

	// TODO: account for rounding
	static isInline(a, b, c) {
		const angle1 = new Vector(a, b).angle();
		const angle2 = new Vector(b, c).angle();

		return angle1 === angle2;
	}

	static label(absoluteLabel, relativeLabel, settings) {
		return (settings.commandsOnNewLines ? '\n' : '') +
			(settings.toAbsolute ? absoluteLabel : relativeLabel) +
			(settings.compress === true ? '' : ' ');
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

	set() {
	}

	convertPoint(point, currentPoint) {
		return this.isAbsolute() ? point : currentPoint.add(point);
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
			if (this.isAbsolute() || settings.toAbsolute) {
				settings.currentPoint = settings.currentPoint.subtract(settings.offset);
				settings.offset = undefined;
			}
		}
	}
}
