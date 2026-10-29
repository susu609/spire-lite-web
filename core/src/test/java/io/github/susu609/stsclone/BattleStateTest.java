package io.github.susu609.stsclone;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BattleStateTest {
    @Test void initialDeckAndEnergy() {
        BattleState battle = new BattleState(42);
        assertEquals(80, battle.playerHp());
        assertEquals(3, battle.energy());
        assertEquals(1, battle.turn());
        assertEquals(10, battle.hand().size() + battle.drawPileSize());
        assertEquals(5, battle.hand().size());
    }

    @Test void invalidCardCannotConsumeEnergy() {
        BattleState battle = new BattleState(42);
        assertFalse(battle.playCard(-1));
        assertFalse(battle.playCard(99));
        assertEquals(3, battle.energy());
    }

    @Test void endTurnResetsBlockAndDrawsCards() {
        BattleState battle = new BattleState(42);
        battle.endTurn();
        assertEquals(2, battle.turn());
        assertEquals(3, battle.energy());
        assertEquals(0, battle.block());
        assertEquals(5, battle.hand().size());
        assertEquals(73, battle.playerHp());
    }
}
