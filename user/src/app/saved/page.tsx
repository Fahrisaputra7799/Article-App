'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import Link from 'next/link';

type Article = {
  id: string;
  title: string;
  slug: string;
  author: string;
};

export default function SavedPage() {
  const [user, setUser] = useState<any>(null);
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const savedQuery = query(
          collection(db, 'saved_articles'),
          where('userId', '==', firebaseUser.uid)
        );
        const savedSnapshot = await getDocs(savedQuery);

        const articlePromises = savedSnapshot.docs.map(async (docSnap) => {
          const articleRef = doc(db, 'articles', docSnap.data().articleId);
          const articleDoc = await getDoc(articleRef);
          if (articleDoc.exists()) {
            return { id: articleDoc.id, ...articleDoc.data() } as Article;
          }
          return null;
        });

        const articles = (await Promise.all(articlePromises)).filter(Boolean) as Article[];
        setSavedArticles(articles);
        setLoading(false);
      } else {
        setUser(null);
        setSavedArticles([]);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) return <div className="p-6">Silakan <Link href="/login" className="text-blue-600 underline">login</Link> dulu.</div>;

  if (savedArticles.length === 0) return <div className="p-6">Belum ada artikel yang disimpan.</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Artikel Tersimpan</h1>
      <ul className="space-y-4">
        {savedArticles.map(article => (
          <li key={article.id} className="p-4 border rounded shadow">
            <Link href={`/article/${article.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
              {article.title}
            </Link>
            <p className="text-sm text-gray-500">By {article.author}</p>
          </li>
        ))}
      </ul>

      <div className='px-20 mt-2'>
      <Link href={'/'}>
        <button className='bg-white w-full rounded-3xl text-black py-2'>back</button>
      </Link>
      </div>
    </main>
  );
}
