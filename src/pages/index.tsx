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
import { format, parseISO } from 'date-fns';
import { api } from "../services/api";
import { useContext } from 'react';
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";
import { PlayerContext} from '../contexts/PlayerContext'

import ptBR from 'date-fns/locale/pt-BR';
import Image from 'next/image'

import styles from './home.module.scss';
import Link from "next/link";

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {

  const { play } = useContext(PlayerContext);

  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>
        <ul>
          {latestEpisodes.map(episode => {
            return (
              <li key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit='cover' />

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => play(episode)}>
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {allEpisodes.map(episode => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover" />
                  </td>
                  <td>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  
                </tr>
              )
            })}
          </tbody>

        </table>
      </section>
    </div>
  )
};

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url
    }
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8
  }
}