import displayValue from 'display-value';
import { assert } from 'type-enforcer';
import { Point } from 'type-enforcer-math';
import { Path } from '../index.js';

const testValues = [{
	note: 'starting simple',
	input: 'm 5,6',
	absolute: 'M 5,6',
	relative: 'm 5,6',
	initial: 'm 5,6',
	auto: 'M 5,6'
}, {
	note: 'remove new lines',
	input: 'M\r 5,\n6',
	absolute: 'M 5,6',
	relative: 'm 5,6',
	initial: 'M 5,6',
	auto: 'M 5,6'
}, {
	note: 'relative line',
	input: 'm 5,6 l10,12',
	absolute: 'M 5,6 L 15,18',
	relative: 'm 5,6 l 10,12',
	initial: 'm 5,6 l 10,12',
	auto: 'M 5,6 L 15,18'
}, {
	note: 'relative line with close',
	input: 'm 5,6 l10,12 z',
	absolute: 'M 5,6 L 15,18 Z',
	relative: 'm 5,6 l 10,12 z',
	initial: 'm 5,6 l 10,12 z',
	auto: 'M 5,6 L 15,18 Z'
}, {
	note: 'relative line with absolute close',
	input: 'm 5,6 l10,12 Z',
	absolute: 'M 5,6 L 15,18 Z',
	relative: 'm 5,6 l 10,12 z',
	initial: 'm 5,6 l 10,12 Z',
	auto: 'M 5,6 L 15,18 Z'
}, {
	note: 'two relative lines inline',
	input: 'm 5,6 l10,12 l10,12 z',
	absolute: 'M 5,6 L 25,30 Z',
	relative: 'm 5,6 l 20,24 z',
	initial: 'm 5,6 l 10,12 10,12 z',
	auto: 'M 5,6 L 25,30 Z'
}, {
	note: 'relative line with consecutive commands',
	input: 'm 5,6 l10,12 8,12 8,12 z',
	absolute: 'M 5,6 L 15,18 31,42 Z',
	relative: 'm 5,6 l 10,12 16,24 z',
	initial: 'm 5,6 l 10,12 8,12 8,12 z',
	auto: 'M 5,6 L 15,18 31,42 Z'
}, {
	note: 'an absolute and relative lines inline',
	input: 'm 5,6 L10,12 l10,12 z',
	absolute: 'M 5,6 L 20,24 Z',
	relative: 'm 5,6 l 15,18 z',
	initial: 'm 5,6 L 10,12 l 10,12 z',
	auto: 'M 5,6 L 20,24 Z'
}, {
	note: 'relative horizontal',
	input: 'm 5,6 h6 z',
	absolute: 'M 5,6 H 11 Z',
	relative: 'm 5,6 h 6 z',
	initial: 'm 5,6 h 6 z',
	auto: 'M 5,6 h 6 Z'
}, {
	note: 'absolute horizontal',
	input: 'm 5,6 H6 z',
	absolute: 'M 5,6 H 6 Z',
	relative: 'm 5,6 h 1 z',
	initial: 'm 5,6 H 6 z',
	auto: 'M 5,6 H 6 Z'
}, {
	note: 'relative vertical',
	input: 'm 5,6 v6 z',
	absolute: 'M 5,6 V 12 Z',
	relative: 'm 5,6 v 6 z',
	initial: 'm 5,6 v 6 z',
	auto: 'M 5,6 v 6 Z'
}, {
	note: 'absolute vertical',
	input: 'm 5,6 V7 z',
	absolute: 'M 5,6 V 7 Z',
	relative: 'm 5,6 v 1 z',
	initial: 'm 5,6 V 7 z',
	auto: 'M 5,6 V 7 Z'
}, {
	note: '',
	input: 'm 5,6 L10,12 l10,12 zm 5,6 L10,12 l10,12 z',
	absolute: 'M 5,6 L 20,24 Z M 10,12 L 20,24 Z',
	relative: 'm 5,6 l 15,18 z m 5,6 l 10,12 z',
	initial: 'm 5,6 L 10,12 l 10,12 z m 5,6 l 10,12 z',
	auto: 'M 5,6 L 20,24 Z m 5,6 L 20,24 Z'
}, {
	note: '',
	input: 'm 5,6 L10,12 l10,12 zM -500,-600 L7,8 l10,12 z',
	absolute: 'M 5,6 L 20,24 Z M -500,-600 L 7,8 17,20 Z',
	relative: 'm 5,6 l 15,18 z m -505,-606 l 507,608 10,12 z',
	initial: 'm 5,6 L 10,12 l 10,12 z M -500,-600 L 7,8 l 10,12 z',
	auto: 'M 5,6 L 20,24 Z M -500,-600 L 7,8 17,20 Z'
}, {
	note: 'Cubic consecutive',
	input: 'm 2,2 C 2,4 4,4 4,2 4,6 6,6 6,4 z',
	absolute: 'M 2,2 C 2,4 4,4 4,2 4,6 6,6 6,4 Z',
	relative: 'm 2,2 c 0,2 2,2 2,0 0,4 2,4 2,2 z',
	initial: 'm 2,2 C 2,4 4,4 4,2 4,6 6,6 6,4 z',
	auto: 'M 2,2 C 2,4 4,4 4,2 4,6 6,6 6,4 Z'
}, {
	note: 'Cubic shorthand',
	input: 'm 2,2 C 2,4 4,4 4,2 S 6,0 6,2 s 2,2 2,0 z',
	absolute: 'M 2,2 C 2,4 4,4 4,2 S 6,0 6,2 8,4 8,2 Z',
	relative: 'm 2,2 c 0,2 2,2 2,0 s 2,-2 2,0 2,2 2,0 z',
	initial: 'm 2,2 C 2,4 4,4 4,2 S 6,0 6,2 s 2,2 2,0 z',
	auto: 'M 2,2 C 2,4 4,4 4,2 S 6,0 6,2 8,4 8,2 Z'
}, {
	note: 'Cubic to consecutive shorthand',
	input: 'm 2,2 C 2,4 4,4 4,2 4,0 6,0 6,2 6,4 8,0 8,2 z',
	absolute: 'M 2,2 C 2,4 4,4 4,2 S 6,0 6,2 8,0 8,2 Z',
	relative: 'm 2,2 c 0,2 2,2 2,0 s 2,-2 2,0 2,-2 2,0 z',
	initial: 'm 2,2 C 2,4 4,4 4,2 S 6,0 6,2 8,0 8,2 z',
	auto: 'M 2,2 C 2,4 4,4 4,2 S 6,0 6,2 8,0 8,2 Z'
}, {
	note: 'Cubic shorthand consecutive',
	input: 'm 2,2 C 2,4 4,4 4,2 S 6,0 6,2 8,0 8,2 Z',
	absolute: 'M 2,2 C 2,4 4,4 4,2 S 6,0 6,2 8,0 8,2 Z',
	relative: 'm 2,2 c 0,2 2,2 2,0 s 2,-2 2,0 2,-2 2,0 z',
	initial: 'm 2,2 C 2,4 4,4 4,2 S 6,0 6,2 8,0 8,2 Z',
	auto: 'M 2,2 C 2,4 4,4 4,2 S 6,0 6,2 8,0 8,2 Z'
}, {
	note: 'Quadratic shorthand',
	input: 'm 2,2 Q 3,3 4,2 T 6,2 t 2,0 z',
	absolute: 'M 2,2 Q 3,3 4,2 T 6,2 8,2 Z',
	relative: 'm 2,2 q 1,1 2,0 t 2,0 2,0 z',
	initial: 'm 2,2 Q 3,3 4,2 T 6,2 t 2,0 z',
	auto: 'M 2,2 Q 3,3 4,2 T 6,2 8,2 Z'
}, {
	note: 'Quadratic to consecutive shorthand',
	input: 'm 2,2 Q 3,3 4,2 5,1 6,2 7,3 8,2 z',
	absolute: 'M 2,2 Q 3,3 4,2 T 6,2 8,2 Z',
	relative: 'm 2,2 q 1,1 2,0 t 2,0 2,0 z',
	initial: 'm 2,2 Q 3,3 4,2 T 6,2 8,2 z',
	auto: 'M 2,2 Q 3,3 4,2 T 6,2 8,2 Z'
}, {
	note: 'Quadratic shorthand consecutive',
	input: 'm 2,2 Q 3,3 4,2 T 6,2 8,2 z',
	absolute: 'M 2,2 Q 3,3 4,2 T 6,2 8,2 Z',
	relative: 'm 2,2 q 1,1 2,0 t 2,0 2,0 z',
	initial: 'm 2,2 Q 3,3 4,2 T 6,2 8,2 z',
	auto: 'M 2,2 Q 3,3 4,2 T 6,2 8,2 Z'
}, {
	note: 'Arc',
	input: 'm 2,2 A 10,10 0 0 0 8,8 a 5,5 0 0 0 12,12 z',
	absolute: 'M 2,2 A 10,10 0 0 0 8,8 5,5 0 0 0 20,20 Z',
	relative: 'm 2,2 a 10,10 0 0 0 6,6 5,5 0 0 0 12,12 z',
	initial: 'm 2,2 A 10,10 0 0 0 8,8 a 5,5 0 0 0 12,12 z',
	auto: 'M 2,2 A 10,10 0 0 0 8,8 5,5 0 0 0 20,20 Z'
}, {
	note: 'Arc consecutive',
	input: 'm 2,2 A 10,10 0 0 0 8,8 5,5 0 0 0 17,17 z',
	absolute: 'M 2,2 A 10,10 0 0 0 8,8 5,5 0 0 0 17,17 Z',
	relative: 'm 2,2 a 10,10 0 0 0 6,6 5,5 0 0 0 9,9 z',
	initial: 'm 2,2 A 10,10 0 0 0 8,8 5,5 0 0 0 17,17 z',
	auto: 'M 2,2 A 10,10 0 0 0 8,8 5,5 0 0 0 17,17 Z'
}];

describe('Path', () => {
	describe('init', () => {
		it('should init with nothing', () => {
			return new Path().export()
				.then((path) => {
					assert.is(path, '');
				});
		});
	});

	describe('.import', () => {
		it('should import a polygon path', () => {
			return new Path()
				.import('50,50 100,100 200,150')
				.export()
				.then((string) => {
					assert.is(string, 'M 50,50 L 100,100 200,150 Z');
				});
		});
	});

	describe('add', () => {
		it('should add a relative Move', () => {
			return new Path()
				.move(3, 4)
				.export()
				.then((path) => {
					assert.is(path, 'm 3,4');
				});
		});

		it('should add an absolute Move', () => {
			return new Path()
				.move(3, 4, true)
				.export()
				.then((path) => {
					assert.is(path, 'M 3,4');
				});
		});

		it('should add an relative Line', () => {
			return new Path()
				.move(3, 4)
				.line(3, 6)
				.export()
				.then((path) => {
					assert.is(path, 'm 3,4 l 3,6');
				});
		});

		it('should add an absolute Line', () => {
			return new Path()
				.move(3, 4)
				.line(3, 6, true)
				.export()
				.then((path) => {
					assert.is(path, 'm 3,4 V 6');
				});
		});
	});

	describe('.update', () => {
		it('should update a line', () => {
			const path = new Path('m 0,0 L10,10 10,20 z');

			path.update(1, '30,30');

			return path.export()
				.then((result) => {
					assert.is(result, 'm 0,0 L 30,30 10,20 z');
				});
		});
	});

	describe('.eachPoint', () => {
		it('should call a callback for every point in a path', () => {
			let total = 0;
			let count = 0;

			new Path('m 1,1 L 4,4 L 50,50 zM 2,2 C 2,4 4,4 4,2 Q 3,3 6,2 A 10,10 0 0 0 8,8 z')
				.eachPoint((point, isControlPoint, index) => { // eslint-disable-line complexity
					if (point.isSame([1, 1]) && isControlPoint === false && index === 0) {
						count++;
					}
					else if (point.isSame([4, 4]) && isControlPoint === false && index === 1) {
						count++;
					}
					else if (point.isSame([50, 50]) && isControlPoint === false && index === 2) {
						count++;
					}
					else if (point.isSame([2, 2]) && isControlPoint === false && index === 4) {
						count++;
					}
					else if (point.isSame([2, 4]) && isControlPoint === true && index === 5) {
						count++;
					}
					else if (point.isSame([4, 4]) && isControlPoint === true && index === 5) {
						count++;
					}
					else if (point.isSame([4, 2]) && isControlPoint === false && index === 5) {
						count++;
					}
					else if (point.isSame([3, 3]) && isControlPoint === true && index === 6) {
						count++;
					}
					else if (point.isSame([6, 2]) && isControlPoint === false && index === 6) {
						count++;
					}
					else if (point.isSame([8, 8]) && isControlPoint === false && index === 7) {
						count++;
					}

					total++;
				});

			assert.is(total, 10);
			assert.is(count, 10);
		});
	});

	describe('.transform', () => {
		const transformSettings = {
			translate: new Point(10, 10),
			scale: new Point(2, 2),
			fractionDigits: 1
		};
		const exportSettings = {
			combine: false
		};

		it('should transform a move', () => {
			return new Path('M 2.47,2.47 m 1.123,1.123 z')
				.transform({
					translate: 10,
					scale: 2,
					fractionDigits: 1
				})
				.export(exportSettings)
				.then((result) => {
					assert.is(result, 'M 24.9,24.9 m 22.2,22.2 z');
				});
		});

		it('should transform a line', () => {
			return new Path('m 1.123,1.123 L 4.123,4.123 l 5.72,5.72 z')
				.transform({
					translate: [10, 10],
					scale: [2, 2],
					fractionDigits: 1
				})
				.export(exportSettings)
				.then((result) => {
					assert.is(result, 'm 22.2,22.2 L 28.2,28.2 l 31.4,31.4 z');
				});
		});

		it('should transform a cubic', () => {
			const path = 'm 1.123,1.123 C 2.123,4.123 4.123,4.123 4.123,2.123 c 10.23,20.45 20.45,20.45 20.45,10.23 z';

			return new Path(path)
				.transform({
					translate: { x: 10, y: 10 },
					scale: { x: 2, y: 2 },
					fractionDigits: 0
				})
				.export(exportSettings)
				.then((result) => {
					assert.is(result, 'm 22,22 C 24,28 28,28 28,24 c 40,61 61,61 61,40 z');
				});
		});

		it('should transform a quadratic', () => {
			return new Path('m 1.123,1.123 Q 4.123,4.123 4.123,2.123 q 20.45,20.45 20.45,10.23 z')
				.transform(transformSettings)
				.export(exportSettings)
				.then((result) => {
					assert.is(result, 'm 22.2,22.2 Q 28.2,28.2 28.2,24.2 q 60.9,60.9 60.9,40.5 z');
				});
		});

		it('should transform an arc', () => {
			return new Path('m 1.123,1.123 A 4.123,4.123 1 0 0 4.123,2.123 a 20.45,20.45 0 1 1 20.45,10.23 z')
				.transform(transformSettings)
				.export(exportSettings)
				.then((result) => {
					assert.is(result, 'm 22.2,22.2 A 8.2,8.2 1 0 0 28.2,24.2 a 40.9,40.9 0 1 1 60.9,40.5 z');
				});
		});

		it('should transform all the things', () => {
			return new Path('m 1,1 L 4,4 L 50,50 zM 2,2 C 2,4 4,4 4,2 Q 3,3 6,2 A 10,10 0 0 0 8,8 z')
				.transform(transformSettings)
				.export(exportSettings)
				.then((result) => {
					assert.is(
						result,
						'm 22,22 L 28,28 120,120 z M 24,24 C 24,28 28,28 28,24 Q 26,26 32,24 A 20,20 0 0 0 36,36 z'
					);
				});
		});
	});

	describe('.export', () => {
		testValues
			.forEach((data) => {
				it(`should convert ${displayValue(data.input)} to absolute coordinates (${data.note})`, () => {
					return new Path(data.input)
						.export({
							coordinates: 'absolute'
						})
						.then((path) => {
							assert.is(path, data.absolute);
						});
				});

				it(`should convert ${displayValue(data.input)} to absolute coordinates when async = true (${data.note})`, () => {
					return new Path(data.input)
						.export({
							coordinates: 'absolute',
							async: true
						})
						.then((path) => {
							assert.is(path, data.absolute);
						});
				});

				it(`should convert ${displayValue(data.input)} to relative coordinates (${data.note})`, () => {
					return new Path(data.input)
						.export({
							coordinates: 'relative'
						})
						.then((path) => {
							assert.is(path, data.relative);
						});
				});

				it(`should convert ${displayValue(data.input)} to relative coordinates, when async = true (${data.note})`, () => {
					return new Path(data.input)
						.export({
							coordinates: 'relative',
							async: true
						})
						.then((path) => {
							assert.is(path, data.relative);
						});
				});

				if (data.initial !== undefined) {
					it(`should convert ${displayValue(data.input)} to its initial coordinates (${data.note})`, () => {
						return new Path(data.input)
							.export({
								combine: false
							})
							.then((path) => {
								assert.is(path, data.initial);
							});
					});
				}

				if (data.auto !== undefined) {
					it(`should convert ${displayValue(data.input)} to auto coordinates (${data.note})`, () => {
						return new Path(data.input)
							.export({
								coordinates: 'auto'
							})
							.then((path) => {
								assert.is(path, data.auto);
							});
					});
				}
			});

		it('should select the shortest strings when coordinates = auto', () => {
			return new Path('M -500,-600 L7,8 l10,12 z')
				.export({
					coordinates: 'auto'
				})
				.then((path) => {
					assert.is(path, 'M -500,-600 L 7,8 17,20 Z');
				});
		});

		it('should remove whitespace when compress = true', () => {
			return new Path('M -500,-600 L7,8 l10,12 z')
				.export({
					coordinates: 'auto',
					compress: true
				})
				.then((path) => {
					assert.is(path, 'M-500-600L7,8,17,20Z');
				});
		});

		it('should scale when a number is provided', () => {
			return new Path('M -500,-600 L7,8 z')
				.export({ scale: 0.1 })
				.then((path) => {
					assert.is(path, 'M -50,-60 L 0.7,0.8 z');
				});
		});

		it('should scale when an array is provided', () => {
			return new Path('M -500,-600 L7,8 z')
				.export({ scale: [0.1, 0.2] })
				.then((path) => {
					assert.is(path, 'M -50,-120 L 0.7,1.6 z');
				});
		});

		it('should scale when an object is provided', () => {
			return new Path('M -500,-600 L7,8 z')
				.export({ scale: { x: 0.1, y: 0.2 } })
				.then((path) => {
					assert.is(path, 'M -50,-120 L 0.7,1.6 z');
				});
		});

		it('should scale when a Point is provided', () => {
			return new Path('M -500,-600 L7,8 z')
				.export({ scale: new Point(0.1, 0.2), fractionDigits: 0 })
				.then((path) => {
					assert.is(path, 'M -50,-120 L 1,2 z');
				});
		});

		it('should translate when a number is provided', () => {
			return new Path('M -500,-600 L7,8 z')
				.export({ translate: 10 })
				.then((path) => {
					assert.is(path, 'M -490,-590 L 17,18 z');
				});
		});

		it('should translate when an array is provided', () => {
			return new Path('M -500,-600 L7,8 z')
				.export({ translate: [10, 20] })
				.then((path) => {
					assert.is(path, 'M -490,-580 L 17,28 z');
				});
		});

		it('should translate when an object is provided', () => {
			return new Path('M -500,-600 L7,8 z')
				.export({ translate: { x: 10, y: 20 } })
				.then((path) => {
					assert.is(path, 'M -490,-580 L 17,28 z');
				});
		});

		it('should translate when a Point is provided', () => {
			return new Path('M -500,-600 L7,8 z')
				.export({ translate: new Point(10, 20) })
				.then((path) => {
					assert.is(path, 'M -490,-580 L 17,28 z');
				});
		});

		it('should remove whitespace around fractions when compress = true', () => {
			return new Path('M -500,-600 L7,8.2 L0.5,0.78 z')
				.export({
					coordinates: 'auto',
					compress: true
				})
				.then((path) => {
					assert.is(path, 'M-500-600L7,8.2.5.78Z');
				});
		});

		it('should add newlines before each command when commandsOnNewLines = true', () => {
			return new Path('m 5,6 L10,12 l10,12 zM -500,-600 L7,8 l10,12 z')
				.export({
					commandsOnNewLines: true,
					combine: false
				})
				.then((path) => {
					assert.is(path, 'm 5,6 \nL 10,12 \nl 10,12 \nz \nM -500,-600 \nL 7,8 \nl 10,12 \nz');
				});
		});

		it('should export a polygon styled string if toPolygon is true', () => {
			return new Path('50,50 100,100 200,150')
				.export({ toPolygon: true })
				.then((path) => {
					assert.is(path, '50,50 100,100 200,150');
				});
		});

		it('should convert curves to a polygon if toPolygon is true', () => {
			return new Path('m 2,2 C 2,4 4,4 4,2 Q 3,3 6,2 A 10,10 0 0 0 8,8')
				.export({
					toPolygon: true,
					compress: false
				})
				.then((path) => {
					assert.is(path, '2,2 4,2 6,2 8,8');
				});
		});
	});
});
