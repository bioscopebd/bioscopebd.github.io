# iOS cloud build

The repository-root workflow at `.github/workflows/ios-simulator.yml` creates the Capacitor iOS project on a macOS runner and uploads an **unsigned simulator app**. A signed device or App Store build requires an Apple Developer account, signing certificate, provisioning profile, and a Mac/Xcode or configured CI signing secrets. The local Windows copy does not contain a built Xcode workspace.

If `ios/` is published as its own GitHub repository, place the same workflow at that repository's `.github/workflows/` and adjust the paths from `ios/app` to `app`.
