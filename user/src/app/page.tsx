'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import Link from 'next/link';
import { Heart, Search, LogOut, User2, Sun, Moon } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

type Article = {
  id: string;
  title: string;
  slug: string;
  author: string;
};

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  // Load saved articles from localStorage
  useEffect(() => {
    const savedArticles = localStorage.getItem('savedArticles');
    if (savedArticles) {
      setSavedIds(JSON.parse(savedArticles));
    }
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  // Cek login user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch artikel
  useEffect(() => {
    const fetchArticles = async () => {
      const snapshot = await getDocs(collection(db, 'articles'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      setArticles(data);
      setFiltered(data);
    };
    fetchArticles();
  }, []);

  // Filter artikel berdasarkan query
  useEffect(() => {
    const results = articles.filter(article =>
      article.title.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(results);
  }, [query, articles]);

  // Toggle simpan artikel
  const toggleSave = (id: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const updated = savedIds.includes(id)
      ? savedIds.filter(item => item !== id)
      : [...savedIds, id];

    setSavedIds(updated);
    localStorage.setItem('savedArticles', JSON.stringify(updated));
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            📘 Artikelku
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/saved" className="text-sm font-medium text-blue-600 hover:underline">
              Favorit
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"
              >
                <User2 className="w-4 h-4" /> Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Jelajahi Artikel Menarik</h1>
        <p className="text-gray-600 mb-6">Temukan dan simpan artikel favoritmu untuk dibaca nanti.</p>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 text-gray-500 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Artikel Grid */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(article => {
            const isSaved = savedIds.includes(article.id);
            return (
              <div
                key={article.id}
                className="relative bg-white border border-gray-200 rounded-2xl p-5 shadow hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/article/${article.slug}`}
                      className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {article.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">By {article.author}</p>
                  </div>

                  <button
                    onClick={() => toggleSave(article.id)}
                    className="text-red-500 hover:scale-110 transition"
                    title={isSaved ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={isSaved ? 'currentColor' : 'none'}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>

                {isSaved && (
                  <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    Tersimpan
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
