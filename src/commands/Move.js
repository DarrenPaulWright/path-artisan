import Command from './Command.js';

const POINT = Symbol();

export default class Move extends Command {
	set(args) {
		this[POINT] = Move.parseArgs(args);
	}

	position(currentPoint) {
		return this.convertPoint(this[POINT], currentPoint);
	}

	export(settings, nextCommands) {
		const point = this.position(settings.currentPoint);

		if (settings.combine !== false && nextCommands[nextCommands.length - 1] instanceof Move) {
			this.preCombine(point, settings);

			return nextCommands.pop().export(settings, nextCommands);
		}

		this.postCombine(settings);

		const result = Move.label('M', 'm', settings) + Move.pointToString(point, settings);

		settings.currentPoint = point;

		return result;
	}
}
