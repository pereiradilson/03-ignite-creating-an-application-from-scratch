import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
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
import Comment from '../../components/Comment';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  previousPost: Post | null;
  nextPost: Post | null;
  preview: boolean;
}

export default function Post({
  post,
  previousPost,
  nextPost,
  preview,
}: PostProps): JSX.Element {
  const router = useRouter();

  const readTime = post.data.content.reduce((acc, content) => {
    const contentText = RichText.asText(content.body);
    const count = contentText.split(/\s+/);
    const calc = Math.ceil(count.length / 200);

    return acc + calc;
  }, 0);

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

      <main className={commonStyles.container}>
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
              <span>{readTime} min</span>
            </div>
          </div>

          {post.last_publication_date && (
            <div className={styles.edited}>
              <span>
                {format(
                  new Date(post.first_publication_date),
                  "'* editado em' dd MMM yyyy', às' HH:mm",
                  {
                    locale: ptBR,
                  }
                )}
              </span>
            </div>
          )}

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

        <div className={styles.footer}>
          <div className={styles.previousAndNextPosts}>
            {previousPost ? (
              <div>
                <p>{previousPost.data.title}</p>
                <Link href={`/post/${previousPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </div>
            ) : (
              <div />
            )}

            {nextPost ? (
              <div>
                <p>{nextPost.data.title}</p>
                <Link href={`/post/${nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </div>
            ) : (
              <div />
            )}
          </div>

          <Comment slug={post.uid} />
        </div>

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const previousPost = (
    await prismic.query([Prismic.predicates.at('document.type', 'posts')], {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
      ref: previewData?.ref ?? null,
    })
  ).results[0];

  const nextPost = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
      ref: previewData?.ref ?? null,
    })
  ).results[0];

  return {
    props: {
      post: response,
      previousPost: previousPost || null,
      nextPost: nextPost || null,
      preview,
    },
    redirect: 60 * 30, // 30 minutes
  };
};
