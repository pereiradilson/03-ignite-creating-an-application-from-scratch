import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <a href="/">
            <h1>Como utilizar Hooks</h1>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={styles.info}>
              <div>
                <FiCalendar color="#BBBBBB" />
                <span>15 Mar 2021</span>
              </div>
              <div>
                <FiUser color="#BBBBBB" />
                <span>Joseph Oliveira</span>
              </div>
            </div>
          </a>

          <a href="/">
            <h1>Criando um app CRA do zero</h1>
            <p>
              Tudo sobre como criar a sua primeira aplicação utilizando Create
              React App
            </p>
            <div className={styles.info}>
              <div>
                <FiCalendar color="#BBBBBB" />
                <span>20 Mar 2021</span>
              </div>
              <div>
                <FiUser color="#BBBBBB" />
                <span>Danilo Vieira</span>
              </div>
            </div>
          </a>
        </div>

        <div className={styles.morePosts}>
          <a href="/">Carregar mais posts</a>
        </div>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
