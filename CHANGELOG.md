# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [0.4.1] - 2020-09-18
### Fixed
- Multiple consecutive shorthand lines now export correctly
- Better logic around exporting fractions when compress = true

## [0.4.0] - 2020-09-17
### Fixed
- Handling lack of whitespace around fractions and arc flags on import.
- Removing more whitespace around fractions and arc flags on export.
- Handling consecutive commands without letters.
- Some bugs around export scale and translate

### Added
- optimizeSvgPaths

## [0.3.3] - 2020-08-20
### Security
- Updating dependencies

## [0.3.2] - 2020-07-15
### Security
- Updating dependencies

## [0.3.1] - 2020-06-09
### Security
- Updating dependencies

## [0.3.0] - 2020-04-03
### Added
- path.transform

## [0.2.1] - 2020-04-03
### Added
- Command index parameter to path.eachPoint

## [0.2.0] - 2020-04-02
### Added
- Support for svg polygon elements
- path.eachPoint

## 0.1.0 - 2020-03-30
### Added
- Path

[0.4.0]: https://github.com/DarrenPaulWright/pathinator/compare/v0.3.3...v0.4.0
[0.3.3]: https://github.com/DarrenPaulWright/pathinator/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/DarrenPaulWright/pathinator/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/DarrenPaulWright/pathinator/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/DarrenPaulWright/pathinator/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/DarrenPaulWright/pathinator/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/DarrenPaulWright/pathinator/compare/v0.1.0...v0.2.0
