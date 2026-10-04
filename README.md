# DELTALab — Releases

Distribution point for **DELTALab**, a desktop application for processing and
standardising clumped isotope data (δ¹³C, δ¹⁸O, Δ₄₇, Δ₄₈).

This repository contains **no source code**. It exists to host built
installers and the manifest the in-app updater reads. Development happens in a
separate, private repository.

## Installing

Download the build for your platform from the
[latest release](https://github.com/MattiaTag/DELTALab-releases/releases/latest).
Download DELTALab only from this repository.

| Platform | File |
|---|---|
| macOS, Apple Silicon (M1 or later) | the `.dmg` |
| Windows, 64-bit | the file ending in `x64-setup.exe` |

DELTALab is not code-signed, so macOS and Windows warn you the first time you
open it on a computer. You only have to get past the warning once per
computer: updates install from inside the app and do not show it again.

### macOS (Apple Silicon)

1. Download the `.dmg`, open it and drag **DELTALab** into **Applications**.
2. Open DELTALab. macOS says it could not verify the app. Click **Done**.
3. Open **System Settings → Privacy & Security**, scroll down to **Security** and
   click **Open Anyway**. Confirm with your password or Touch ID.

If macOS says DELTALab "is damaged and can't be opened", or if you prefer the
Terminal, run this once after step 1 and then open DELTALab normally:

```
xattr -dr com.apple.quarantine /Applications/DELTALab.app
```

DELTALab needs an Apple Silicon Mac (M1 or later).

### Windows (64-bit)

1. Download the file ending in `x64-setup.exe` and run it. If your browser warns that
   the file is not commonly downloaded, choose to keep it.
2. Windows shows **Windows protected your PC**. Click **More info**, then
   **Run anyway**.

If something still blocks DELTALab:

- **There is no "Run anyway" button.** Your organisation's policy, or Smart App
  Control on Windows 11, blocks unsigned apps and has no exception for a single app.
  Ask your IT department to allow DELTALab. On your own PC, DELTALab runs only with
  Smart App Control turned off (**Windows Security → App & browser control**).
- **DELTALab stays on "Starting DELTALab…".** Your antivirus may have quarantined
  `deltalab-api.exe`, the part of DELTALab that does the calculations. Restore it
  from the antivirus quarantine, or install DELTALab again, and add an exclusion for
  the folder `%LOCALAPPDATA%\DELTALab`.

### Updates

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

## Code signing

The installers are not signed with Apple or Microsoft certificates, which is
why your system warns the first time you open DELTALab (see
[Installing](#installing)).

Updates are checked separately: the in-app updater verifies every update
against a signing key built into DELTALab and will not install one that does
not match.
