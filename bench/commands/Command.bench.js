import { benchSettings } from 'karma-webpack-bundle';
import Command from '../../src/commands/Command.js';

suite('Command', () => {
	let temporaryTarget = {};

	benchmark('single point', () => {
		temporaryTarget = Command.clean('1,2');
	}, benchSettings);

	benchmark('three points', () => {
		temporaryTarget = Command.clean('1,2 3,4 5,6');
	}, benchSettings);

	benchmark('three points compressed', () => {
		temporaryTarget = Command.clean('1,2-3,-4 5-9');
	}, benchSettings);

	benchmark('three points dirty', () => {
		temporaryTarget = Command.clean(' 123.456\t,0.6\r-3 ,-123.456\n 5-0.6   ');
	}, benchSettings);
});
