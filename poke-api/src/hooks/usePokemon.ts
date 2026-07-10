import axios from "axios";
import { useEffect, useState } from "react";
import { IPokemon } from "../interfaces/interface";

export const usePokemon = (url?: string, id?: string) => {
  const [pokemon, setPokemon] = useState<null | undefined | IPokemon>();

  const fetchPokemon = async () => {
    if (url) {
      const { data } = await axios.get<IPokemon>(url);
      setPokemon(data);
    } else if (id) {
      const { data } = await axios.get<IPokemon>(
        `https://pokeapi.co/api/v2/pokemon/${id}`
      );
      setPokemon(data);
    }
  };

  useEffect(() => {
    fetchPokemon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, id]);

  return { pokemon };
};