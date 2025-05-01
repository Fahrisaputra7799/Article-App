'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

async function handleLogout() {
  await signOut(auth);
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const router = useRouter();

  // Fetch article based on the slug
  useEffect(() => {
    const fetchArticle = async () => {
      const snapshot = await getDocs(collection(db, 'articles'));
      const found = snapshot.docs.find(doc => doc.data().slug === slug);
      if (found) setArticle({ id: found.id, ...found.data() });
    };
    fetchArticle();
  }, [slug]);

  // Check if the user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Toggle save article action
  const toggleSave = async (id: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const updated = savedIds.includes(id)
      ? savedIds.filter(item => item !== id)
      : [...savedIds, id];

    setSavedIds(updated);
    localStorage.setItem('savedArticles', JSON.stringify(updated));

    // Optionally, save to Firebase as well
    await setDoc(doc(db, 'saved_articles', `${user.uid}_${id}`), {
      userId: user.uid,
      articleId: id,
      savedAt: new Date(),
    });
  };

  if (!article) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            📘 Artikelku
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{article.title}</h1>
          <p className="text-sm text-gray-600 mt-2">Written by {article.author}</p>
        </header>

        {/* Article Body */}
        <article className="prose dark:prose-invert text-black prose-lg max-w-none space-y-6 mb-8">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        {/* Save Button */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => toggleSave(article.id)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition transform hover:scale-105"
          >
            {savedIds.includes(article.id) ? 'Artikel Disimpan' : 'Simpan Artikel'}
          </button>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
