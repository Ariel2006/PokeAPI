import { IPokemon } from "../../../../interfaces/interface";
import styles from "./styles.module.scss";

interface Props {
  pokemon: IPokemon | null;
  backgroundSelected: string;
}

export const BaseStats = ({ pokemon, backgroundSelected }: Props) => {
  const maxStat = 255;

  const baseStatsNames: Record<"hp" | "attack" | "defense" | "special-attack" | "special-defense" | "speed", string> = {
    hp: "hp",
    attack: "atk",
    defense: "def",
    "special-attack": "satk",
    "special-defense": "sdef",
    speed: "spd",
  };

  return (
    <div className={styles.baseStats}>
      {pokemon?.stats?.map(({ base_stat, stat: { name } }) => {
        return (
          <div key={name} className={styles.item}>
            <span style={{ color: backgroundSelected }}>

              {baseStatsNames[name as keyof typeof baseStatsNames]}
            </span>
            <div className={styles.rigth}>
              <p>0{base_stat}</p>
              <div className={styles.line}>
                <div
                  className={styles.background}
                  style={{ background: backgroundSelected }}
                />
                <div
                  className={styles.secondLine}
                  style={{
                    background: backgroundSelected,
                    opacity: "1",
                    width: `${(base_stat / maxStat) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};