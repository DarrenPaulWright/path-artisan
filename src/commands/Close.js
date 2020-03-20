import Command from './Command.js';

export default class Close extends Command {
	position(currentPoint, subPathStart) {
		return subPathStart;
	}

	export(settings) {
		settings.currentPoint = settings.subPathStart;

		return Close.label('Z', 'z', settings);
	}
}
