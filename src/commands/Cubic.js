import origin from '../utility/origin.js';
import Command from './Command.js';

export const DATA = Symbol();

export default class Cubic extends Command {
	set(args, previous, currentPoint) {
		this[DATA] = Cubic.parseArgs(args);

		if (this[DATA].length === 2) {
			this[DATA].unshift(this.reflectPreviousControlPoint(previous, currentPoint));
		}
	}

	position(currentPoint) {
		return this.convertPoint(this[DATA][this[DATA].length - 1], currentPoint);
	}

	controlPoint() {
		return this[DATA][this[DATA].length - 1].subtract(this[DATA][this[DATA].length - 2]);
	}

	isLine(currentPoint) {
		return Cubic.isInline(
			this.isAbsolute() ? currentPoint : origin,
			...this[DATA]
		);
	}

	isShorthand(settings, controlPoint) {
		if (settings.previous instanceof Cubic) {
			return controlPoint
				.subtract(settings.currentPoint)
				.isSame(settings.previous.controlPoint());
		}

		if (settings.toAbsolute) {
			return controlPoint.isSame(settings.currentPoint);
		}

		return controlPoint.isSame(origin);
	}

	export(settings) {
		const control1 = this.convertPoint(this[DATA][0], settings.currentPoint);
		const control2 = this.convertPoint(this[DATA][1], settings.currentPoint);
		const point = this.convertPoint(this[DATA][2], settings.currentPoint);
		let result = '';

		if (this.isShorthand(settings, control1)) {
			result = Cubic.label('S', 's', settings) +
				Cubic.pointToString(control2, settings);
		}
		else {
			result = Cubic.label('C', 'c', settings) +
				Cubic.pointToString(control1, settings) +
				Cubic.pointToString(control2, settings, true);
		}

		result += Cubic.pointToString(point, settings, true);

		settings.currentPoint = point;

		return result;
	}
}
