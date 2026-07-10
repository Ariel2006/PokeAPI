import { useParams } from "react-router-dom";
import { PokemonDetail } from "../../components/PokemonDetail/index.tsx";
import { usePokemon } from "../../hooks/usePokemon.ts";

export const PokeDetail = () => {
  const { pokeId } = useParams();
  const { pokemon } = usePokemon("", pokeId);

  return <PokemonDetail pokemon={pokemon!} />;
};