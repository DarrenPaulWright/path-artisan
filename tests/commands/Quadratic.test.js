import { assert } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import Quadratic from '../../src/commands/Quadratic.js';

describe('Quadratic', () => {
	const currentPoint = Object.freeze(new Point(10, 10));

	describe('.split', () => {
		it('should return an empty array when an empty string is provided', () => {
			assert.equal(Quadratic.split(['']), []);
		});

		it('should return an empty array when one point is provided', () => {
			assert.equal(Quadratic.split(['1,2']), []);
		});

		it('should return 2 points when 2 points are provided', () => {
			assert.equal(Quadratic.split(['1,2 3,4']), [
				[new Point(1, 2), new Point(3, 4)]
			]);
		});

		it('should return multiple Points when multiple are provided', () => {
			assert.equal(Quadratic.split(['1,2 3,4 5,6 1,2 3,4 5,6 7,8']), [
				[new Point(1, 2), new Point(3, 4)],
				[new Point(5, 6), new Point(1, 2)],
				[new Point(3, 4), new Point(5, 6)]
			]);
		});
	});

	describe('controlPoint', () => {
		it('should return diff to the second controlPoint', () => {
			const quadratic = new Quadratic(['4,2 4,0']);

			assert.equal(quadratic.controlPoint(), new Point(0, -2));
		});
	});

	describe('shorthand', () => {
		let settings = {};

		beforeEach(() => {
			settings = {
				toAbsolute: true,
				currentPoint
			};
		});

		it('should reflect the last control point from a previous Quadratic', () => {
			const previous = new Quadratic(['4,-2 4,0']);
			const quadratic = new Quadratic(['4,0'], previous, currentPoint);

			assert.equal(quadratic.export(settings, []), 'Q 10,12 14,10');
			assert.equal(settings.currentPoint, new Point(14, 10));
		});

		it('should reflect the last control point from a previous Quadratic when this is absolute', () => {
			const previous = new Quadratic(['4,-2 4,0']);
			const quadratic = new Quadratic(['18,10'], previous, new Point(14, 10), true);

			settings.previous = previous;

			assert.equal(quadratic.export(settings, []), 'Q 14,12 18,10');
			assert.equal(settings.currentPoint, new Point(18, 10));
		});

		it('should use the currentPoint if no previous Quadratic is provided', () => {
			const quadratic = new Quadratic(['4,0'], null, new Point());

			assert.equal(quadratic.export(settings, []), 'T 14,10');
			assert.equal(settings.currentPoint, new Point(14, 10));
		});
	});

	describe('isLine', () => {
		describe('isAbsolute', () => {
			it('should return true if the handle is the same as the first point', () => {
				const quadratic = new Quadratic(['10,10 15,15'], null, null, true);

				assert.equal(quadratic.isLine(currentPoint), true);
			});

			it('should return true if the handle is the same as the second point', () => {
				const quadratic = new Quadratic(['15,15 15,15'], null, null, true);

				assert.equal(quadratic.isLine(currentPoint), true);
			});

			it('should return true if the handle is in line', () => {
				const quadratic = new Quadratic(['13,13 16,16'], null, null, true);

				assert.equal(quadratic.isLine(currentPoint), true);
			});

			it('should return false if the first handle is not in line', () => {
				const quadratic = new Quadratic(['12,12.1 16,16'], null, null, true);

				assert.equal(quadratic.isLine(currentPoint), false);
			});

			it('should return false if the handle is not between the points', () => {
				const quadratic = new Quadratic(['0,0 5,5'], null, null, true);

				assert.equal(quadratic.isLine(currentPoint), false);
			});
		});

		describe('isRelative', () => {
			it('should return true if the handle is the same as the first point', () => {
				const quadratic = new Quadratic(['0,0 5,5']);

				assert.equal(quadratic.isLine(currentPoint), true);
			});

			it('should return true if the handle is the same as the second point', () => {
				const quadratic = new Quadratic(['5,5 5,5']);

				assert.equal(quadratic.isLine(currentPoint), true);
			});

			it('should return true if the handle is in line', () => {
				const quadratic = new Quadratic(['3,3 6,6']);

				assert.equal(quadratic.isLine(currentPoint), true);
			});

			it('should return false if the first handle is not in line', () => {
				const quadratic = new Quadratic(['2,2.1 6,6']);

				assert.equal(quadratic.isLine(currentPoint), false);
			});

			it('should return false if the handle is not between the points', () => {
				const quadratic = new Quadratic(['-1,-1 5,5']);

				assert.equal(quadratic.isLine(currentPoint), false);
			});
		});
	});

	describe('export', () => {
		describe('toAbsolute', () => {
			let settings = {};

			beforeEach(() => {
				settings = {
					toAbsolute: true,
					currentPoint
				};
			});

			it('should convert from relative', () => {
				const quadratic = new Quadratic(['1,2 3,4']);

				assert.equal(quadratic.export(settings, []), 'Q 11,12 13,14');
				assert.equal(settings.currentPoint, new Point(13, 14));
			});

			it('should convert from absolute', () => {
				const quadratic = new Quadratic(['1,2 3,4'], null, null, true);

				assert.equal(quadratic.export(settings, []), 'Q 1,2 3,4');
				assert.equal(settings.currentPoint, new Point(3, 4));
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
				const quadratic = new Quadratic(['11,12 13,14'], null, null, true);

				assert.equal(quadratic.export(settings, []), 'q 1,2 3,4');
				assert.equal(settings.currentPoint, new Point(13, 14));
			});

			it('should convert from relative', () => {
				const quadratic = new Quadratic(['1,2 3,4']);

				assert.equal(quadratic.export(settings, []), 'q 1,2 3,4');
				assert.equal(settings.currentPoint, new Point(13, 14));
			});
		});
	});
});
