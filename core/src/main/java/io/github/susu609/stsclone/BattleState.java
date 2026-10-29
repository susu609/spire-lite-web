package io.github.susu609.stsclone;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/** Platform-independent combat rules; can be reused by Android and desktop renderers. */
public final class BattleState {
    private final Random random;
    private final List<CardType> drawPile = new ArrayList<>();
    private final List<CardType> discardPile = new ArrayList<>();
    private final List<CardType> hand = new ArrayList<>();

    private int playerHp = 80;
    private int block;
    private int energy;
    private int enemyHp = 48;
    private int enemyVulnerable;
    private int turn;
    private String message = "Play a card, then end your turn.";

    public BattleState(long seed) {
        random = new Random(seed);
        for (int i = 0; i < 5; i++) drawPile.add(CardType.STRIKE);
        for (int i = 0; i < 4; i++) drawPile.add(CardType.DEFEND);
        drawPile.add(CardType.BASH);
        Collections.shuffle(drawPile, random);
        startTurn();
    }

    private void startTurn() {
        turn++;
        block = 0;
        energy = 3;
        draw(5);
    }

    private void draw(int amount) {
        for (int i = 0; i < amount; i++) {
            if (drawPile.isEmpty()) {
                if (discardPile.isEmpty()) break;
                drawPile.addAll(discardPile);
                discardPile.clear();
                Collections.shuffle(drawPile, random);
            }
            hand.add(drawPile.remove(drawPile.size() - 1));
        }
    }

    /** Returns false for invalid indices, insufficient energy, or completed battles. */
    public boolean playCard(int index) {
        if (isFinished() || index < 0 || index >= hand.size()) return false;
        CardType card = hand.get(index);
        if (energy < card.cost()) return false;
        energy -= card.cost();
        hand.remove(index);
        discardPile.add(card);
        switch (card) {
            case STRIKE -> damageEnemy(6);
            case DEFEND -> block += 5;
            case BASH -> {
                damageEnemy(8);
                if (enemyHp > 0) enemyVulnerable += 2;
            }
        }
        message = "Used " + card.displayName() + ".";
        if (enemyHp <= 0) message = "Victory! Press Restart for a new encounter.";
        return true;
    }

    private void damageEnemy(int base) {
        int damage = enemyVulnerable > 0 ? (base * 3) / 2 : base;
        enemyHp = Math.max(0, enemyHp - damage);
    }

    public boolean endTurn() {
        if (isFinished()) return false;
        discardPile.addAll(hand);
        hand.clear();
        int actualDamage = Math.max(0, enemyIntent() - block);
        playerHp = Math.max(0, playerHp - actualDamage);
        if (enemyVulnerable > 0) enemyVulnerable--;
        if (playerHp <= 0) {
            message = "Defeat! Press Restart to try again.";
            return true;
        }
        startTurn();
        message = "Enemy dealt " + actualDamage + " damage. Your turn.";
        return true;
    }

    public int enemyIntent() { return turn % 3 == 0 ? 12 : 7; }
    public boolean isFinished() { return playerHp <= 0 || enemyHp <= 0; }
    public boolean hasWon() { return enemyHp <= 0; }
    public int playerHp() { return playerHp; }
    public int block() { return block; }
    public int energy() { return energy; }
    public int enemyHp() { return enemyHp; }
    public int enemyVulnerable() { return enemyVulnerable; }
    public int turn() { return turn; }
    public int drawPileSize() { return drawPile.size(); }
    public int discardPileSize() { return discardPile.size(); }
    public List<CardType> hand() { return Collections.unmodifiableList(hand); }
    public String message() { return message; }
}
