import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "../../../../assets/arrows.tsx";
import { PokeballIconBig } from "../../../../assets/pokeball.tsx";
import { IPokemon } from "../../../../interfaces/interface.ts";

import styles from "./styles.module.scss";

interface Props {
  pokemon: IPokemon | null;
}

export const Header = ({ pokemon }: Props) => {
  const navigate = useNavigate();

  return (
    <header>
      <PokeballIconBig className={styles.pokeball} />
      <div className={styles.left}>
        <ArrowLeftIcon onClick={() => navigate(-1)} />

        <span>{pokemon?.name}</span>
      </div>
      <p>#{pokemon?.id}</p>
    </header>
  );
};