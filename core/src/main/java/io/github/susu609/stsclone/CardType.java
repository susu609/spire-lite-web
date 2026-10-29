package io.github.susu609.stsclone;

/** First independent prototype card definitions. No third-party art or data files. */
public enum CardType {
    STRIKE("Strike", 1, "Deal 6 damage"),
    DEFEND("Defend", 1, "Gain 5 Block"),
    BASH("Bash", 2, "Deal 8 damage, 2 Vulnerable");

    private final String displayName;
    private final int cost;
    private final String description;

    CardType(String displayName, int cost, String description) {
        this.displayName = displayName;
        this.cost = cost;
        this.description = description;
    }

    public String displayName() { return displayName; }
    public int cost() { return cost; }
    public String description() { return description; }
}
