import { useEffect, useRef } from 'react';

interface CommentProps {
  slug: string;
}

export default function Comment({ slug }: CommentProps): JSX.Element {
  const commentsDiv = useRef<HTMLDivElement>();

  useEffect(() => {
    const utterances = document.getElementsByClassName('utterances')[0];

    if (utterances) {
      utterances.remove();
    }

    if (commentsDiv) {
      const scriptEl = document.createElement('script');
      scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
      scriptEl.setAttribute('crossorigin', 'anonymous');
      scriptEl.setAttribute('async', 'true');
      scriptEl.setAttribute(
        'repo',
        'pereiradilson/03-ignite-creating-an-application-from-scratch'
      );
      scriptEl.setAttribute('issue-term', 'pathname');
      scriptEl.setAttribute('theme', 'github-dark');
      commentsDiv.current.appendChild(scriptEl);
    }
  }, [slug]);

  return <div ref={commentsDiv} />;
}
