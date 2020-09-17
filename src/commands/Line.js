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
				this.setExportShorthand(true, settings);
				result = Line.label('H', 'h', settings) +
					Line.numberToString(Line.transform(point, settings).x, settings);
			}
			else if (settings.currentPoint.x === point.x) {
				this.setExportShorthand(true, settings);
				result = Line.label('V', 'v', settings) +
					Line.numberToString(Line.transform(point, settings).y, settings);
			}
			else {
				this.setExportShorthand(false, settings);
				result = Line.label('L', 'l', settings) + Line.pointToString(point, settings);
			}
		}

		settings.currentPoint = point;

		return result;
	}
}
