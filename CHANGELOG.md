# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [4.0.1] - 2017-11-09
### Changed
- Merged PR#10 - Ignore ngrx/effects actions

## [4.0.0] - 2017-08-14
**Breaking**

Support for ngrx 4+

## [3.0.0] - 2017-04-12
### Changed
- Support Ionic 3.
- Support for Ionic Storage 2+ only.

**Breaking Change Alert**

If you are using Ionic Storage v1 and are reluctant to upgrade to v2, please continue to use v2.0.0 of this library.

When upgrading to v3.0.0 of this library, please ensure you are using Ionic Storage v2 in your app.

## [2.0.0] - 2017-03-02
### Changed
- Values are now stored as their native data type, i.e. objects are stored as objects, arrays as arrays, etc. Prior to this release, all values were stringified for storage, and destringified when retrieved.

**Breaking Change Alert**

If you are using v1.0.0 and you want to upgrade to v2.0.0, you will need migrate your stored data from 'stringified' form into object form.

## 1.0.0 - 2017-02-01
### Added
- Initial release.

[2.0.0]: https://github.com/natural-apptitude/ngrx-store-ionic-storage/compare/v1.0.0...v2.0.0
