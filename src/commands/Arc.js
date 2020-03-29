import { Point } from 'type-enforcer-math';
import origin from '../utility/origin.js';
import Command from './Command.js';

export const DATA = Symbol();

export default class Arc extends Command {
	set(args) {
		args = Arc.clean(args[0]);

		this[DATA] = [
			new Point(args[0], args[1]),
			args[2],
			args[3],
			args[4],
			new Point(args[5], args[6])
		];
	}

	position(currentPoint) {
		return this.convertPoint(this[DATA][4], currentPoint);
	}

	export(settings) {
		const radius = this[DATA][0];
		const point = this.convertPoint(this[DATA][4], settings.currentPoint);
		let result = '';

		result = Arc.label('A', 'a', settings) +
			Arc.pointToString(radius, {
				...settings,
				currentPoint: origin
			}) +
			Arc.numberToString(this[DATA][1], settings) +
			Arc.numberToString(this[DATA][2], settings) +
			Arc.numberToString(this[DATA][3], settings) +
			Arc.pointToString(point, settings, true);

		settings.currentPoint = point;

		return result;
	}
}
