# Java foundation (Phase 0)

The existing HTML5 prototype is retained as a reference. Java lives in `core/` and the desktop launcher in `lwjgl3/`.

## Requirements

- JDK 21 to run Gradle (Java sources target release 17).
- Gradle 8.14.3 until the standard Gradle Wrapper files are checked in.
- IntelliJ IDEA Community Edition or newer for editing.
- Internet connection once to resolve dependencies from Maven Central.

## Desktop commands

```sh
gradle :core:test :lwjgl3:classes
gradle :lwjgl3:run
```

Once a local Gradle installation is available, generate and commit the official wrapper:

```sh
gradle wrapper --gradle-version 8.14.3 --distribution-type bin
./gradlew :core:test :lwjgl3:classes
./gradlew :lwjgl3:run
```

On Windows use `gradlew.bat` rather than `./gradlew`.

## Architecture

- `core/src/main/java/.../BattleState.java`: pure Java combat logic (deck/hand, energy, block, damage, enemy intent).
- `core/src/main/java/.../CardType.java`: starter card definitions.
- `core/src/main/java/.../CombatScreen.java`: libGDX renderer and click/touch routing.
- `lwjgl3/src/main/java/.../Lwjgl3Launcher.java`: desktop entry point.
- `core/src/test/`: JUnit combat tests.
- `.github/workflows/java-ci.yml`: desktop compile and tests on push/PR.

## Planned next stages

1. Complete reproducible Gradle Wrapper and verify GitHub Actions.
2. Extract card effects, encounter, actor, and status into independent mechanics.
3. Add navigation/map, drops, items and persistent saves.
4. Add the Android module once PC build and tests are green (requires Android SDK).

The Java code does not yet import HTML saves or reproduce all content/features from the web prototype.
