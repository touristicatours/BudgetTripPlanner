'use client';
import { useEffect, useState } from 'react';
import SideDock from '@/src/components/SideDock';
import Chip from '@/src/components/ui/Chip';
import { addCommunityPost, getCommunityPosts, CommunityPost, bumpPref } from '@/src/lib/clientStore';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [image, setImage] = useState<string>('');

  useEffect(()=>{ setPosts(getCommunityPosts()); },[]);

  async function onUpload(e:any) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function publish() {
    if (!image || !title) return alert('Add a photo and a title');
    const post: CommunityPost = { id: String(Date.now()), title, imageDataUrl: image, author:'You', tags, createdAt: new Date().toISOString() };
    addCommunityPost(post);
    tags.forEach(t=>bumpPref(t,1));
    setPosts(getCommunityPosts());
    setTitle(''); setTags([]); setImage('');
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <SideDock />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gradient mb-6">Community</h1>
            <div className="bg-white rounded-2xl p-4 shadow border mb-6">
              <h3 className="font-semibold mb-2">Share your experience</h3>
              <input className="border rounded-lg px-3 py-2 w-full mb-2" placeholder="Title (e.g., Hidden gelato in Trastevere)" value={title} onChange={e=>setTitle(e.target.value)} />
              <div className="flex gap-2 mb-2">
                {['foodie','nightlife','beach','culture','nature','walk'].map(t => (
                  <Chip key={t} active={tags.includes(t)} onClick={()=> setTags(p=> p.includes(t) ? p.filter(x=>x!==t) : [...p,t]) }>{t}</Chip>
                ))}
              </div>
              <input type="file" accept="image/*" onChange={onUpload} className="mb-3" />
              {image && <img src={image} alt="preview" className="h-40 rounded-lg object-cover mb-3" />}
              <button className="btn-primary" onClick={publish}>Publish</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map(p => (
                <div key={p.id} className="bg-white rounded-xl p-3 shadow border">
                  <img src={p.imageDataUrl} alt={p.title} className="w-full h-40 object-cover rounded-lg" />
                  <div className="mt-2">
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-xs text-gray-500">by {p.author} • {new Date(p.createdAt||'').toLocaleDateString()}</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {(p.tags||[]).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


