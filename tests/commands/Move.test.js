import { assert } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Move from '../../src/commands/Move.js';

describe('Move', () => {
	const currentPoint = new Point(10, 10);

	it('should parse an initial string', () => {
		const move = new Move(['1,2']);
		const settings = {
			toAbsolute: false,
			currentPoint
		};

		assert.equal(move.export(settings, []), 'm 1,2');
	});

	it('should parse initial numbers', () => {
		const move = new Move([3, 4]);
		const settings = {
			toAbsolute: false,
			currentPoint
		};

		assert.equal(move.export(settings, []), 'm 3,4');
	});

	describe('toAbsolute', () => {
		let settings = {};

		beforeEach(() => {
			settings = {
				toAbsolute: true,
				currentPoint
			};
		});

		it('should convert from absolute', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [];

			assert.equal(move.export(settings, nextCommands), 'M 1,2');
			assert.equal(settings.currentPoint, new Point(1, 2));
			assert.equal(nextCommands.length, 0);
		});

		it('should convert from relative', () => {
			const move = new Move(['1,2']);
			const nextCommands = [];

			assert.equal(move.export(settings, nextCommands), 'M 11,12');
			assert.equal(settings.currentPoint, new Point(11, 12));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, absolute', () => {
			const move = new Move(['1,2']);
			const nextCommands = [new Move(['3, 4'], null, null, true)];

			assert.equal(move.export(settings, nextCommands), 'M 3,4');
			assert.equal(settings.currentPoint, new Point(3, 4));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, relative', () => {
			const move = new Move(['1,2']);
			const nextCommands = [new Move(['3,4'])];

			assert.equal(move.export(settings, nextCommands), 'M 14,16');
			assert.equal(settings.currentPoint, new Point(14, 16));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, absolute, relative', () => {
			const move = new Move(['1,2']);
			const nextCommands = [
				new Move(['3, 4']),
				new Move(['3, 4'], null, null, true)
			];

			assert.equal(move.export(settings, nextCommands), 'M 6,8');
			assert.equal(settings.currentPoint, new Point(6, 8));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, relative, relative', () => {
			const move = new Move(['1,2']);
			const nextCommands = [
				new Move(['3,4']),
				new Move(['3,4'])
			];

			assert.equal(move.export(settings, nextCommands), 'M 17,20');
			assert.equal(settings.currentPoint, new Point(17, 20));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, absolute', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [new Move(['3, 4'], null, null, true)];

			assert.equal(move.export(settings, nextCommands), 'M 3,4');
			assert.equal(settings.currentPoint, new Point(3, 4));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, relative', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [new Move(['3,4'])];

			assert.equal(move.export(settings, nextCommands), 'M 4,6');
			assert.equal(settings.currentPoint, new Point(4, 6));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, absolute, relative', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [
				new Move(['3, 4']),
				new Move(['3, 4'], null, null, true)
			];

			assert.equal(move.export(settings, nextCommands), 'M 6,8');
			assert.equal(settings.currentPoint, new Point(6, 8));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, relative, relative', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [
				{},
				new Move(['3,4']),
				new Move(['3,4'])
			];

			assert.equal(move.export(settings, nextCommands), 'M 7,10');
			assert.equal(settings.currentPoint, new Point(7, 10));
			assert.equal(nextCommands.length, 1);
		});
	});

	describe('toRelative', () => {
		let settings = {};

		beforeEach(() => {
			settings = {
				toAbsolute: false,
				currentPoint
			};
		});

		it('should convert from absolute', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [];

			assert.equal(move.export(settings, nextCommands), 'm -9,-8');
			assert.equal(settings.currentPoint, new Point(1, 2));
			assert.equal(nextCommands.length, 0);
		});

		it('should convert from relative', () => {
			const move = new Move(['1,2']);
			const nextCommands = [];

			assert.equal(move.export(settings, nextCommands), 'm 1,2');
			assert.equal(settings.currentPoint, new Point(11, 12));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, absolute', () => {
			const move = new Move(['1,2']);
			const nextCommands = [new Move(['3, 4'], null, null, true)];

			assert.equal(move.export(settings, nextCommands), 'm -7,-6');
			assert.equal(settings.currentPoint, new Point(3, 4));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, relative', () => {
			const move = new Move(['1,2']);
			const nextCommands = [new Move(['3,4'])];

			assert.equal(move.export(settings, nextCommands), 'm 4,6');
			assert.equal(settings.currentPoint, new Point(14, 16));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, absolute, relative', () => {
			const move = new Move(['1,2']);
			const nextCommands = [
				new Move(['3, 4']),
				new Move(['3, 4'], null, null, true)
			];

			assert.equal(move.export(settings, nextCommands), 'm -4,-2');
			assert.equal(settings.currentPoint, new Point(6, 8));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, relative, relative', () => {
			const move = new Move(['1,2']);
			const nextCommands = [
				new Move(['3,4']),
				new Move(['3,4'])
			];

			assert.equal(move.export(settings, nextCommands), 'm 7,10');
			assert.equal(settings.currentPoint, new Point(17, 20));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, absolute', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [new Move(['3, 4'], null, null, true)];

			assert.equal(move.export(settings, nextCommands), 'm -7,-6');
			assert.equal(settings.currentPoint, new Point(3, 4));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, relative', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [new Move(['3,4'])];

			assert.equal(move.export(settings, nextCommands), 'm -6,-4');
			assert.equal(settings.currentPoint, new Point(4, 6));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, absolute, relative', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [
				new Move(['3, 4']),
				new Move(['3, 4'], null, null, true)
			];

			assert.equal(move.export(settings, nextCommands), 'm -4,-2');
			assert.equal(settings.currentPoint, new Point(6, 8));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, relative, relative', () => {
			const move = new Move(['1,2'], null, null, true);
			const nextCommands = [
				new Move(['3,4']),
				new Move(['3,4'])
			];

			assert.equal(move.export(settings, nextCommands), 'm -3,0');
			assert.equal(settings.currentPoint, new Point(7, 10));
			assert.equal(nextCommands.length, 0);
		});
	});
});
