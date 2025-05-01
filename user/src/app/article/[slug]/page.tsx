// app/article/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const snapshot = await getDocs(collection(db, 'articles'));
      const found = snapshot.docs.find(doc => doc.data().slug === slug);
      if (found) setArticle({ id: found.id, ...found.data() });
    };

    fetchArticle();
  }, [slug]);

  const [user, setUser] = useState<any>(null);

useEffect(() => {
  onAuthStateChanged(auth, (user) => {
    setUser(user);
  });
}, []);


const saveArticle = async () => {
    if (!user) {
      alert('Silakan login dulu!');
      return;
    }
  
    const savedId = `${user.uid}_${article.id}`; // kombinasi unik
    await setDoc(doc(db, 'saved_articles', savedId), {
      userId: user.uid,
      articleId: article.id,
      savedAt: new Date(),
    });
  
    alert('Artikel disimpan!');
  };

  if (!article) return <div className="p-6">Loading...</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-sm text-gray-500 mb-6">By {article.author}</p>
      <div className="prose prose-lg">{article.content}</div>

      {user && (
    <button
      onClick={saveArticle}
      className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Simpan Artikel
    </button>
    )}
  {!user && (
    <p className="mt-4 text-sm text-gray-600">
      <a href="/login" className="text-blue-600 underline">Login</a> untuk menyimpan artikel
    </p>
  )}
    </main>

    
  );
}
