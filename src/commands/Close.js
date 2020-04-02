import Command from './Command.js';

export default class Close extends Command {
	position(currentPoint, subPathStart) {
		return subPathStart;
	}

	eachPoint(settings) {
		settings.currentPoint = settings.subPathStart;
	}

	export(settings) {
		settings.currentPoint = settings.subPathStart;

		return Close.label('Z', 'z', settings);
	}
}
