package io.github.susu609.stsclone;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.InputAdapter;
import com.badlogic.gdx.ScreenAdapter;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.glutils.ShapeRenderer;
import com.badlogic.gdx.math.Vector3;
import com.badlogic.gdx.utils.viewport.FitViewport;

/** Minimal playable desktop UI; all combat rules live in BattleState. */
public final class CombatScreen extends ScreenAdapter {
    private static final int WIDTH = 1280;
    private static final int HEIGHT = 720;
    private static final int CARD_W = 200;
    private static final int CARD_H = 218;
    private static final int CARD_GAP = 20;
    private final FitViewport viewport = new FitViewport(WIDTH, HEIGHT);
    private final ShapeRenderer shapes = new ShapeRenderer();
    private final SpriteBatch batch = new SpriteBatch();
    private final BitmapFont font = new BitmapFont();
    private BattleState battle = new BattleState(System.nanoTime());

    @Override public void show() {
        font.getData().setScale(1.45f);
        Gdx.input.setInputProcessor(new InputAdapter() {
            @Override public boolean touchDown(int screenX, int screenY, int pointer, int button) {
                Vector3 p = viewport.unproject(new Vector3(screenX, screenY, 0));
                if (inside(p, 1040, 625, 180, 54)) {
                    battle = new BattleState(System.nanoTime());
                    return true;
                }
                if (battle.isFinished()) return true;
                if (inside(p, 1010, 300, 210, 64)) {
                    battle.endTurn();
                    return true;
                }
                for (int i = 0; i < battle.hand().size(); i++) {
                    if (inside(p, 55 + i * (CARD_W + CARD_GAP), 32, CARD_W, CARD_H)) {
                        battle.playCard(i);
                        return true;
                    }
                }
                return false;
            }
        });
    }

    private static boolean inside(Vector3 p, int x, int y, int w, int h) {
        return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
    }

    @Override public void render(float delta) {
        Gdx.gl.glClearColor(0.055f, 0.073f, 0.11f, 1);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);
        viewport.apply();
        shapes.setProjectionMatrix(viewport.getCamera().combined);
        shapes.begin(ShapeRenderer.ShapeType.Filled);
        shapes.setColor(0.14f, 0.18f, 0.25f, 1);
        shapes.rect(50, 392, 360, 200);
        shapes.rect(810, 392, 410, 200);
        shapes.setColor(0.15f, 0.35f, 0.44f, 1);
        shapes.rect(1040, 625, 180, 54);
        shapes.setColor(0.42f, 0.22f, 0.12f, 1);
        shapes.rect(1010, 300, 210, 64);
        for (int i = 0; i < battle.hand().size(); i++) {
            CardType card = battle.hand().get(i);
            boolean canPlay = battle.energy() >= card.cost();
            shapes.setColor(canPlay ? new Color(0.31f, 0.32f, 0.48f, 1) : new Color(0.18f, 0.19f, 0.23f, 1));
            shapes.rect(55 + i * (CARD_W + CARD_GAP), 32, CARD_W, CARD_H);
        }
        shapes.end();
        batch.setProjectionMatrix(viewport.getCamera().combined);
        batch.begin();
        label("SPIRE CLONE  |  Java / libGDX", 55, 665);
        label("Restart", 1070, 658);
        label("HERO", 80, 548);
        label("HP: " + battle.playerHp() + "/80", 80, 504);
        label("Block: " + battle.block(), 80, 465);
        label("Energy: " + battle.energy() + "/3", 80, 421);
        label("TRAINING ENEMY", 835, 548);
        label("HP: " + battle.enemyHp() + "/48", 835, 504);
        label("Intent: Attack " + battle.enemyIntent(), 835, 463);
        label("Vulnerable: " + battle.enemyVulnerable(), 835, 422);
        label("Turn " + battle.turn() + "   Draw " + battle.drawPileSize() + "   Discard " + battle.discardPileSize(), 55, 354);
        label(battle.message(), 55, 309);
        label("End turn", 1050, 340);
        for (int i = 0; i < battle.hand().size(); i++) {
            CardType card = battle.hand().get(i);
            int x = 70 + i * (CARD_W + CARD_GAP);
            label(card.displayName(), x, 206);
            label("Cost " + card.cost(), x, 157);
            label(card == CardType.BASH ? "8 dmg + Vuln" : (card == CardType.DEFEND ? "5 Block" : "6 damage"), x, 91);
        }
        batch.end();
    }

    private void label(String text, float x, float y) {
        font.draw(batch, text, x, y);
    }

    @Override public void resize(int width, int height) {
        viewport.update(width, height, true);
    }

    @Override public void dispose() {
        Gdx.input.setInputProcessor(null);
        shapes.dispose();
        batch.dispose();
        font.dispose();
    }
}
