# DELTALab — Releases

Distribution point for **DELTALab**, a desktop application for processing and
standardising clumped isotope data (δ¹³C, δ¹⁸O, Δ₄₇, Δ₄₈).

This repository contains **no source code**. It exists to host built
installers and the manifest the in-app updater reads. Development happens in a
separate, private repository.

## Installing

Download the build for your platform from the
[latest release](https://github.com/MattiaTag/DELTALab-releases/releases/latest):

| Platform | File |
|---|---|
| macOS (Apple Silicon) | `.dmg`, `aarch64` |
| macOS (Intel) | `.dmg`, `x86_64` |
| Windows (x86_64) | `.exe` installer or `.msi` |

Once installed, DELTALab checks for updates on startup and offers them through
a banner. Updates are never applied without your confirmation.

## Your data is not touched by an update

The database and configuration live outside the application bundle — under
`~/Library/Application Support/DELTALab/` on macOS and `%APPDATA%\DELTALab\`
on Windows. An update replaces only the application itself.

DELTALab additionally takes an automatic backup before every version change,
and that backup is exempt from the normal retention limit, so there is always
a recovery point from immediately before an upgrade.

## Reporting a problem

Use the in-app **Contacts → Report a bug** form, which can attach a diagnostics
bundle (app version, OS, table row counts, recent log tail — no measurement
data). Issues on this repository are also read.

## Verifying a download

The signing and auto-update pipeline is still being set up, and no releases
have been published yet. Once it is live, artifacts will be signed, the updater
will verify signatures automatically before installing, and instructions for
verifying a download by hand will be added here.
