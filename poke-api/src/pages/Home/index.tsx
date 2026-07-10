import { useContext } from "react";
import { PokeballIconSmall } from "../../assets/pokeball.tsx";
import { Filters } from "../../components/Filters";
import { Pagination } from "../../components/Pagination/index.tsx";
import { PokemonList } from "../../components/PokemonList";
import { PokemonContext } from "../../context/PokemonContext.tsx";
import { usePagination } from "../../hooks/usePagination.ts";

import styles from "./styles.module.scss";

export const Home = () => {
  const { pokemonsFiltered } = useContext(PokemonContext);
  const { page, nextPage, previousPage, backToHome } = usePagination();

  let perPage = 12;

  return (
    <div className={styles.home}>
      <header>
        <div onClick={backToHome}>
          <PokeballIconSmall />
          <span>Pokédex</span>
        </div>
      </header>
      <Filters />
      <PokemonList
        page={page}
        perPage={perPage}
        pokemonsUrls={pokemonsFiltered}
      />
      <Pagination
        page={page}
        perPage={perPage}
        nextPage={nextPage}
        previousPage={previousPage}
        maxItems={pokemonsFiltered?.length || 0}
      />
    </div>
  );
};