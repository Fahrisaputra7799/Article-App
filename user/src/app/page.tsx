// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import {db} from '@/lib/firebase'
import Link from 'next/link';

type Article = {
  id: string;
  title: string;
  slug: string;
  author: string;
};

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const snapshot = await getDocs(collection(db, 'articles'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      setArticles(data);
    };

    fetchArticles();
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Daftar Artikel</h1>
      <ul className="space-y-3">
        {articles.map(article => (
          <li key={article.id} className="p-4 border rounded shadow">
            <Link href={`/article/${article.slug}`} className="text-lg font-medium text-blue-600 hover:underline">
              {article.title}
            </Link>
            <p className="text-sm text-gray-600">By {article.author}</p>
          </li>
        ))}
      </ul>
      <div className='px-20 mt-2'>
      <Link href={'/saved'}>
        <button className='bg-white w-full rounded-3xl text-black py-2'>Favorite</button>
      </Link>
      </div>
    </main>
  );
}
