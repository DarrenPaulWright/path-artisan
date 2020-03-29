import { assert } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Line from '../../src/commands/Line.js';

describe('Line', () => {
	const currentPoint = new Point(10, 10);

	it('should parse an initial string', () => {
		const line = new Line(['1,2']);
		const settings = {
			toAbsolute: false,
			currentPoint
		};

		assert.is(line.export(settings, []), 'l 1,2');
	});

	it('should parse initial numbers', () => {
		const line = new Line([3, 4]);
		const settings = {
			toAbsolute: false,
			currentPoint
		};

		assert.is(line.export(settings, []), 'l 3,4');
	});

	describe('shorthand', () => {
		describe('toAbsolute', () => {
			it('should convert a horizontal line', () => {
				const line = new Line([4, 0]);
				const nextCommands = [];
				const settings = {
					toAbsolute: true,
					currentPoint
				};

				assert.equal(line.export(settings, nextCommands), 'H 14');
				assert.equal(settings.currentPoint, new Point(14, 10));
				assert.equal(nextCommands.length, 0);
			});

			it('should convert a vertical line', () => {
				const line = new Line([0, 4]);
				const nextCommands = [];
				const settings = {
					toAbsolute: true,
					currentPoint
				};

				assert.equal(line.export(settings, nextCommands), 'V 14');
				assert.equal(settings.currentPoint, new Point(10, 14));
				assert.equal(nextCommands.length, 0);
			});

			it('should convert a relative non line', () => {
				const line = new Line([0, 0]);
				const nextCommands = [];
				const settings = {
					toAbsolute: true,
					currentPoint
				};

				assert.equal(line.export(settings, nextCommands), '');
				assert.equal(settings.currentPoint, new Point(10, 10));
				assert.equal(nextCommands.length, 0);
			});

			it('should convert an absolute non line', () => {
				const line = new Line([10, 10], null, null, true);
				const nextCommands = [];
				const settings = {
					toAbsolute: true,
					currentPoint
				};

				assert.equal(line.export(settings, nextCommands), '');
				assert.equal(settings.currentPoint, new Point(10, 10));
				assert.equal(nextCommands.length, 0);
			});

			it('should merge absolute, relative', () => {
				const line = new Line([10, 20], null, null, true);
				const nextCommands = [
					new Line([0, 10])
				];
				const settings = {
					toAbsolute: true,
					currentPoint
				};

				assert.equal(line.export(settings, nextCommands), 'V 30');
				assert.equal(settings.currentPoint, new Point(10, 30));
				assert.equal(nextCommands.length, 0);
			});
		});

		describe('toRelative', () => {
			it('should convert a horizontal line', () => {
				const line = new Line([3, 10], null, null, true);
				const nextCommands = [];
				const settings = {
					toAbsolute: false,
					currentPoint
				};

				assert.equal(line.export(settings, nextCommands), 'h -7');
				assert.equal(settings.currentPoint, new Point(3, 10));
				assert.equal(nextCommands.length, 0);
			});

			it('should convert a vertical line', () => {
				const line = new Line([10, 4], null, null, true);
				const nextCommands = [];
				const settings = {
					toAbsolute: false,
					currentPoint
				};

				assert.equal(line.export(settings, nextCommands), 'v -6');
				assert.equal(settings.currentPoint, new Point(10, 4));
				assert.equal(nextCommands.length, 0);
			});

			it('should convert a relative non line', () => {
				const line = new Line([0, 0]);
				const nextCommands = [];
				const settings = {
					toAbsolute: false,
					currentPoint
				};

				assert.equal(line.export(settings, nextCommands), '');
				assert.equal(settings.currentPoint, new Point(10, 10));
				assert.equal(nextCommands.length, 0);
			});

			it('should convert an absolute non line', () => {
				const line = new Line([10, 10], null, null, true);
				const nextCommands = [];
				const settings = {
					toAbsolute: false,
					currentPoint
				};

				assert.equal(line.export(settings, nextCommands), '');
				assert.equal(settings.currentPoint, new Point(10, 10));
				assert.equal(nextCommands.length, 0);
			});
		});
	});

	describe('toAbsolute', () => {
		let settings;

		beforeEach(() => {
			settings = {
				toAbsolute: true,
				currentPoint
			};
		});

		it('should convert from absolute', () => {
			const line = new Line([1, 2], null, null, true);
			const nextCommands = [];

			assert.equal(line.export(settings, nextCommands), 'L 1,2');
			assert.equal(settings.currentPoint, new Point(1, 2));
			assert.equal(nextCommands.length, 0);
		});

		it('should convert from relative', () => {
			const line = new Line([1, 2]);
			const nextCommands = [];

			assert.equal(line.export(settings, nextCommands), 'L 11,12');
			assert.equal(settings.currentPoint, new Point(11, 12));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, absolute', () => {
			const line = new Line([0, 2]);
			const nextCommands = [new Line(['10, 14'], null, null, true)];

			assert.equal(line.export(settings, nextCommands), 'V 14');
			assert.equal(settings.currentPoint, new Point(10, 14));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, relative', () => {
			const line = new Line([3, 0]);
			const nextCommands = [new Line(['4,0'])];

			assert.equal(line.export(settings, nextCommands), 'H 17');
			assert.equal(settings.currentPoint, new Point(17, 10));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, absolute, relative', () => {
			const line = new Line([-4, -4]);
			const nextCommands = [
				new Line(['7, 4']),
				new Line(['-2, -2']),
				new Line(['4, 4'], null, null, true)
			];

			assert.equal(line.export(settings, nextCommands), 'L 2,2');
			assert.equal(settings.currentPoint, new Point(2, 2));
			assert.equal(nextCommands.length, 1);
		});

		it('should merge relative, relative, relative', () => {
			const line = new Line([1, 2]);
			const nextCommands = [
				new Line(['3,6']),
				new Line(['3,6'])
			];

			assert.equal(line.export(settings, nextCommands), 'L 17,24');
			assert.equal(settings.currentPoint, new Point(17, 24));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, absolute', () => {
			const line = new Line([8, 8], null, null, true);
			const nextCommands = [new Line(['5, 5'], null, null, true)];

			assert.equal(line.export(settings, nextCommands), 'L 5,5');
			assert.equal(settings.currentPoint, new Point(5, 5));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, relative', () => {
			const line = new Line([10, 20], null, null, true);
			const nextCommands = [new Line(['0,40'])];

			assert.equal(line.export(settings, nextCommands), 'V 60');
			assert.equal(settings.currentPoint, new Point(10, 60));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, absolute, relative', () => {
			const line = new Line([8, 8], null, null, true);
			const nextCommands = [
				new Line(['-2, -2']),
				new Line(['6, 6'], null, null, true)
			];

			assert.equal(line.export(settings, nextCommands), 'L 4,4');
			assert.equal(settings.currentPoint, new Point(4, 4));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, relative, relative', () => {
			const line = new Line([8, 6], null, null, true);
			const nextCommands = [
				{},
				new Line(['-2,-4']),
				new Line(['-2,-4'])
			];

			assert.equal(line.export(settings, nextCommands), 'L 4,-2');
			assert.equal(settings.currentPoint, new Point(4, -2));
			assert.equal(nextCommands.length, 1);
		});
	});

	describe('toRelative', () => {
		let settings;

		beforeEach(() => {
			settings = {
				toAbsolute: false,
				currentPoint
			};
		});

		it('should convert from absolute', () => {
			const line = new Line([1, 2], null, null, true);
			const nextCommands = [];

			assert.equal(line.export(settings, nextCommands), 'l -9,-8');
			assert.equal(settings.currentPoint, new Point(1, 2));
			assert.equal(nextCommands.length, 0);
		});

		it('should convert from relative', () => {
			const line = new Line([1, 2]);
			const nextCommands = [];

			assert.equal(line.export(settings, nextCommands), 'l 1,2');
			assert.equal(settings.currentPoint, new Point(11, 12));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, absolute', () => {
			const line = new Line([0, 2]);
			const nextCommands = [new Line(['10, 14'], null, null, true)];

			assert.equal(line.export(settings, nextCommands), 'v 4');
			assert.equal(settings.currentPoint, new Point(10, 14));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, relative', () => {
			const line = new Line([3, 0]);
			const nextCommands = [new Line(['4,0'])];

			assert.equal(line.export(settings, nextCommands), 'h 7');
			assert.equal(settings.currentPoint, new Point(17, 10));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge relative, absolute, relative', () => {
			const line = new Line([-4, -4]);
			const nextCommands = [
				new Line(['7, 4']),
				new Line(['-2, -2']),
				new Line(['4, 4'], null, null, true)
			];

			assert.equal(line.export(settings, nextCommands), 'l -8,-8');
			assert.equal(settings.currentPoint, new Point(2, 2));
			assert.equal(nextCommands.length, 1);
		});

		it('should merge relative, relative, relative', () => {
			const line = new Line([1, 2]);
			const nextCommands = [
				new Line(['3,6']),
				new Line(['3,6'])
			];

			assert.equal(line.export(settings, nextCommands), 'l 7,14');
			assert.equal(settings.currentPoint, new Point(17, 24));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, absolute', () => {
			const line = new Line([8, 8], null, null, true);
			const nextCommands = [new Line(['5, 5'], null, null, true)];

			assert.equal(line.export(settings, nextCommands), 'l -5,-5');
			assert.equal(settings.currentPoint, new Point(5, 5));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, relative', () => {
			const line = new Line([10, 20], null, null, true);
			const nextCommands = [new Line(['0,40'])];

			assert.equal(line.export(settings, nextCommands), 'v 50');
			assert.equal(settings.currentPoint, new Point(10, 60));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, absolute, relative', () => {
			const line = new Line([8, 8], null, null, true);
			const nextCommands = [
				new Line(['-2, -2']),
				new Line(['6, 6'], null, null, true)
			];

			assert.equal(line.export(settings, nextCommands), 'l -6,-6');
			assert.equal(settings.currentPoint, new Point(4, 4));
			assert.equal(nextCommands.length, 0);
		});

		it('should merge absolute, relative, relative', () => {
			const line = new Line([8, 6], null, null, true);
			const nextCommands = [
				{},
				new Line(['-2,-4']),
				new Line(['-2,-4'])
			];

			assert.equal(line.export(settings, nextCommands), 'l -6,-12');
			assert.equal(settings.currentPoint, new Point(4, -2));
			assert.equal(nextCommands.length, 1);
		});
	});
});
