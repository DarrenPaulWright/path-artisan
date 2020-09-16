import Command from './Command.js';

const POINT = Symbol();

export default class Line extends Command {
	static split(args) {
		return Command.split(args, 1);
	}

	set(args) {
		this[POINT] = Line.parseArgs(args);
	}

	position(currentPoint) {
		return this.convertPoint(this[POINT], currentPoint);
	}

	transform(settings) {
		this[POINT] = Line.transform(this[POINT], settings);
	}

	export(settings, nextCommands) {
		const point = this.position(settings.currentPoint);

		if (settings.combine !== false && nextCommands[nextCommands.length - 1] instanceof Line) {
			if (
				Line.isInline(
					settings.currentPoint,
					point,
					nextCommands[nextCommands.length - 1].position(point)
				)
			) {
				this.preCombine(point, settings);

				return nextCommands.pop().export(settings, nextCommands);
			}
		}

		this.postCombine(settings);

		let result = '';

		if (!settings.currentPoint.isSame(point)) {
			this.isExportedAbsolute = settings.toAbsolute;

			if (settings.currentPoint.y === point.y) {
				this.isExportedShorthand = true;
				result = Line.label('H', 'h', settings) + Line.transform(point, settings).x;
			}
			else if (settings.currentPoint.x === point.x) {
				this.isExportedShorthand = true;
				result = Line.label('V', 'v', settings) + Line.transform(point, settings).y;
			}
			else {
				this.isExportedShorthand = false;
				result = Line.label('L', 'l', settings, this) + Line.pointToString(point, settings);
			}
		}

		settings.currentPoint = point;

		return result;
	}
}
