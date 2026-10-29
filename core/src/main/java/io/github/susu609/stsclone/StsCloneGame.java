package io.github.susu609.stsclone;

import com.badlogic.gdx.Game;

public final class StsCloneGame extends Game {
    @Override public void create() {
        setScreen(new CombatScreen());
    }

    @Override public void dispose() {
        super.dispose();
    }
}
