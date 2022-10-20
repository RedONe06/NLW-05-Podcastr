/*
SPA
// Dados são carregados somente quando o usuário acessa a tela.

// dispara uma função a partir da alteração de uma 
// caso o javascript seja desabilitado as informações não vão aparecer e
os dados consequentemente não irão ser puxados (comando em javascript)

useEffect(() => {
  fetch('http://localhost:3333/episodes')
  .then(response => response.json())
  .then(data => console.log(data))
}, [])

SSR

// dados são carregados no servidor e não no browser

export function getServerSideProps(){
  const response = await fetch('http://localhost:3333/episodes');
  const data = await response.json()
  return{
    props: {
      episodes: data,
    }
  }
}

SSG

// define a constancia de atualização da página, carrega o html cru (estático), só funciona em produção

export function getStaticProps(){
  const response = await fetch('http://localhost:3333/episodes');
  const data = await response.json()
  return{
    props: {
      episodes: data,
    },
    revalidate: 60 * 60 * 8

  }
}
*/
import { GetStaticProps } from "next";
import {format, parseISO} from 'date-fns';
import { api } from "../services/api";
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";

type Episode = {
  id: string;
  title: string;
  members: string;
  published_at: string;
}

type HomeProps = {
  episodes: Episode[];
}

export default function Home(props:HomeProps) {
  return (
    <>
      <h1>Index</h1>
      <p>{JSON.stringify(props.episodes)}</p>
    </>
  )
};

export const getStaticProps: GetStaticProps = async () => {
  const {data} = await api.get('episodes', {
    params: {
      _limit:12,
      _sort:"published_at",
      _order: 'desc'
    }
  });

  const episodes = data.map(episode => {
    return{
      id: episode.id,
      title: episode.title,
      thumbnail:episode.thumbnail,
      members: episode.members,
      publishedAt:format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR}),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url
    }
  })

  return {
    props: {
      episodes
    },
    revalidate: 60 * 60 * 8
  }
}