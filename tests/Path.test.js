import displayValue from 'display-value';
import { assert } from 'type-enforcer';
import { Path } from '../index.js';

const testValues = [{
	note: 'starting simple',
	input: 'm 5,6',
	absolute: 'M 5,6',
	relative: 'm 5,6',
	initial: 'm 5,6',
	auto: 'm 5,6'
}, {
	note: 'remove new lines',
	input: 'M\r 5,\n6',
	absolute: 'M 5,6',
	relative: 'm 5,6',
	initial: 'M 5,6',
	auto: 'm 5,6'
}, {
	note: 'relative line',
	input: 'm 5,6 l10,12',
	absolute: 'M 5,6 L 15,18',
	relative: 'm 5,6 l 10,12',
	initial: 'm 5,6 l 10,12',
	auto: 'm 5,6 l 10,12'
}, {
	note: 'relative line with close',
	input: 'm 5,6 l10,12 z',
	absolute: 'M 5,6 L 15,18 Z',
	relative: 'm 5,6 l 10,12 z',
	initial: 'm 5,6 l 10,12 z',
	auto: 'm 5,6 l 10,12 z'
}, {
	note: 'relative line with absolute close',
	input: 'm 5,6 l10,12 Z',
	absolute: 'M 5,6 L 15,18 Z',
	relative: 'm 5,6 l 10,12 z',
	initial: 'm 5,6 l 10,12 Z',
	auto: 'm 5,6 l 10,12 z'
}, {
	note: 'two relative lines inline',
	input: 'm 5,6 l10,12 l10,12 z',
	absolute: 'M 5,6 L 25,30 Z',
	relative: 'm 5,6 l 20,24 z',
	initial: 'm 5,6 l 10,12 l 10,12 z',
	auto: 'm 5,6 l 20,24 z'
}, {
	note: 'an absolute and relative lines inline',
	input: 'm 5,6 L10,12 l10,12 z',
	absolute: 'M 5,6 L 20,24 Z',
	relative: 'm 5,6 l 15,18 z',
	initial: 'm 5,6 L 10,12 l 10,12 z',
	auto: 'm 5,6 l 15,18 z'
}, {
	note: 'relative horizontal',
	input: 'm 5,6 h6 z',
	absolute: 'M 5,6 H 11 Z',
	relative: 'm 5,6 h 6 z',
	initial: 'm 5,6 h 6 z',
	auto: 'm 5,6 h 6 z'
}, {
	note: 'absolute horizontal',
	input: 'm 5,6 H6 z',
	absolute: 'M 5,6 H 6 Z',
	relative: 'm 5,6 h 1 z',
	initial: 'm 5,6 H 6 z',
	auto: 'm 5,6 h 1 z'
}, {
	note: 'relative vertical',
	input: 'm 5,6 v6 z',
	absolute: 'M 5,6 V 12 Z',
	relative: 'm 5,6 v 6 z',
	initial: 'm 5,6 v 6 z',
	auto: 'm 5,6 v 6 z'
}, {
	note: 'absolute vertical',
	input: 'm 5,6 V7 z',
	absolute: 'M 5,6 V 7 Z',
	relative: 'm 5,6 v 1 z',
	initial: 'm 5,6 V 7 z',
	auto: 'm 5,6 v 1 z'
}, {
	input: 'm 5,6 L10,12 l10,12 zm 5,6 L10,12 l10,12 z',
	absolute: 'M 5,6 L 20,24 Z M 10,12 L 20,24 Z',
	relative: 'm 5,6 l 15,18 z m 5,6 l 10,12 z',
	initial: 'm 5,6 L 10,12 l 10,12 z m 5,6 l 10,12 z',
	auto: 'm 5,6 l 15,18 z m 5,6 l 10,12 z'
}, {
	input: 'm 5,6 L10,12 l10,12 zM -500,-600 L7,8 l10,12 z',
	absolute: 'M 5,6 L 20,24 Z M -500,-600 L 7,8 L 17,20 Z',
	relative: 'm 5,6 l 15,18 z m -505,-606 l 507,608 l 10,12 z',
	initial: 'm 5,6 L 10,12 l 10,12 z M -500,-600 L 7,8 l 10,12 z',
	auto: 'm 5,6 l 15,18 z m -505,-606 L 7,8 l 10,12 z'
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

	describe('export', () => {
		testValues
			.forEach((data) => {
				it(`should convert ${displayValue(data.input)} to absolute coordinates`, () => {
					return new Path(data.input)
						.export({
							coordinates: 'absolute'
						})
						.then((path) => {
							assert.is(path, data.absolute);
						});
				});

				it(`should convert ${displayValue(data.input)} to absolute coordinates when async = true`, () => {
					return new Path(data.input)
						.export({
							coordinates: 'absolute',
							async: true
						})
						.then((path) => {
							assert.is(path, data.absolute);
						});
				});

				it(`should convert ${displayValue(data.input)} to relative coordinates`, () => {
					return new Path(data.input)
						.export({
							coordinates: 'relative'
						})
						.then((path) => {
							assert.is(path, data.relative);
						});
				});

				it(`should convert ${displayValue(data.input)} to relative coordinates, when async = true`, () => {
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
					it(`should convert ${displayValue(data.input)} to its initial coordinates`, () => {
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
					it(`should convert ${displayValue(data.input)} to auto coordinates`, () => {
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
					assert.is(path, 'm -500,-600 L 7,8 l 10,12 z');
				});
		});

		it('should remove whitespace when compress = true', () => {
			return new Path('M -500,-600 L7,8 l10,12 z')
				.export({
					coordinates: 'auto',
					compress: true
				})
				.then((path) => {
					assert.is(path, 'm-500-600L7,8l10,12z');
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
	});
});
