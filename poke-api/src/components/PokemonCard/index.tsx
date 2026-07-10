import { usePokemon } from "../../hooks/usePokemon.ts";
import { background } from "../../utils/BackgroundsByType.ts";
import { Link } from "react-router-dom";
import { Loader } from "../Loader";

import styles from "./styles.module.scss";

interface Props {
  url: string;
}

export const PokemonCard = ({ url }: Props) => {
  const { pokemon } = usePokemon(url);


  const typeName = (pokemon?.types?.[0]?.type?.name ?? "default") as keyof typeof background;
  const backgroundSelected = background[typeName];

  return (
    <Link to={`/${pokemon?.id}`} className={styles.pokeCard}>
      <div className={styles.top} data-testid="pokemon-card"></div>
      <div style={{ borderColor: backgroundSelected }} className={styles.top}>
        <span style={{ color: backgroundSelected }}>#{pokemon?.id}</span>
        {pokemon?.sprites?.other?.dream_world?.front_default ||
        pokemon?.sprites?.front_default ? (
          <img
            src={
              pokemon?.sprites?.other?.dream_world?.front_default ||
              pokemon?.sprites?.front_default
            }
            alt={pokemon?.name}
          />
        ) : (
          <div className={styles.loadingContainer}>
            <Loader color={backgroundSelected} />
          </div>
        )}
      </div>
      <div style={{ background: backgroundSelected }} className={styles.bottom}>
        {pokemon?.name}
      </div>
    </Link>
  );
};