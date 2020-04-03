import { isArray } from 'type-enforcer-math';
import Cubic, { DATA } from './Cubic.js';

export default class Quadratic extends Cubic {
	set(args, previous, currentPoint) {
		this[DATA] = Quadratic.parseArgs(args);

		if (!isArray(this[DATA])) {
			this[DATA] = [this.reflectPreviousControlPoint(previous, currentPoint), this[DATA]];
		}
	}

	eachPoint(settings, callback, index) {
		const point = this.position(settings.currentPoint);

		callback(this.convertPoint(this[DATA][0], settings.currentPoint), true, index);
		callback(point, false, index);

		settings.currentPoint = point;
	}

	export(settings) {
		const control = this.convertPoint(this[DATA][0], settings.currentPoint);
		const point = this.convertPoint(this[DATA][1], settings.currentPoint);
		let result = '';

		if (!settings.toPolygon) {
			if (this.isShorthand(settings, control)) {
				result = Quadratic.label('T', 't', settings);
			}
			else {
				result = Quadratic.label('Q', 'q', settings) +
					Quadratic.pointToString(control, settings);
			}
		}

		result += Quadratic.pointToString(
			point,
			settings,
			!settings.toPolygon && !this.isShorthand(settings, control)
		);

		settings.currentPoint = point;

		return result;
	}
}
