import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="" />
      </div>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <div>
              <FiCalendar color="#BBBBBB" />
              <span>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>
            </div>
            <div>
              <FiUser color="#BBBBBB" />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock color="#BBBBBB" />
              <span>4 min</span>
            </div>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(content => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 3,
    }
  );

  const postUids = posts.results.map(post => {
    return {
      params: {
        slug: String(post.uid),
      },
    };
  });

  return {
    paths: postUids,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
    redirect: 60 * 30, // 30 minutes
  };
};
