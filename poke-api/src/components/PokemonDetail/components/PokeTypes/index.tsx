import { IPokemon } from "../../../../interfaces/interface.ts";
import { background } from "../../../../utils/BackgroundsByType.ts";

import styles from "./styles.module.scss";

interface Props {
  pokemon: IPokemon | null;
}

export const PokeTypes = ({ pokemon }: Props) => {
  return (
    <div className={styles.types}>
      
      {pokemon?.types.map(({ type: { name } }) => (
        <div
          key={name}
          
          style={{ background: background[name] }}
          className={styles.type}
        >
          {name}
        </div>
      ))}
    </div>
  );
};