'use client';

import { useState, useEffect } from 'react';
import { WebsiteContent } from '@/types';

export default function ContentManagement() {
  const [content, setContent] = useState<WebsiteContent>({
    hero: {
      title: 'Premium 4G & 5G Mobile Plans',
      subtitle: 'Get the Best Network Coverage',
      description: 'Choose from the top US carriers with unbeatable prices and coverage.',
    },
    about: {
      title: 'About Us',
      content: 'We provide the best mobile network plans from major US carriers at competitive prices.',
    },
    contact: {
      title: 'Contact Us',
      content: 'Get in touch with us for any questions or support.',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('websiteContent');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setContent(parsed);
        } catch (e) {
          console.error('Error loading content:', e);
        }
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('websiteContent', JSON.stringify(content));
    alert('Đã lưu nội dung thành công! Refresh trang mua để xem thay đổi.');
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục nội dung mặc định?')) {
      setContent({
        hero: {
          title: 'Premium 4G & 5G Mobile Plans',
          subtitle: 'Get the Best Network Coverage',
          description: 'Choose from the top US carriers with unbeatable prices and coverage.',
        },
        about: {
          title: 'About Us',
          content: 'We provide the best mobile network plans from major US carriers at competitive prices.',
        },
        contact: {
          title: 'Contact Us',
          content: 'Get in touch with us for any questions or support.',
        },
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản Lý Nội Dung</h2>
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Khôi Phục Mặc Định
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-save mr-2"></i>Lưu Nội Dung
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">
            <i className="fas fa-home mr-2 text-blue-400"></i>
            Hero Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold">Tiêu Đề Chính</label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, title: e.target.value },
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Tiêu Đề Phụ</label>
              <input
                type="text"
                value={content.hero.subtitle}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, subtitle: e.target.value },
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Mô Tả</label>
              <textarea
                value={content.hero.description}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, description: e.target.value },
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">
            <i className="fas fa-info-circle mr-2 text-purple-400"></i>
            About Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold">Tiêu Đề</label>
              <input
                type="text"
                value={content.about.title}
                onChange={(e) => setContent({
                  ...content,
                  about: { ...content.about, title: e.target.value },
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Nội Dung</label>
              <textarea
                value={content.about.content}
                onChange={(e) => setContent({
                  ...content,
                  about: { ...content.about, content: e.target.value },
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                rows={5}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">
            <i className="fas fa-envelope mr-2 text-green-400"></i>
            Contact Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold">Tiêu Đề</label>
              <input
                type="text"
                value={content.contact.title}
                onChange={(e) => setContent({
                  ...content,
                  contact: { ...content.contact, title: e.target.value },
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Nội Dung</label>
              <textarea
                value={content.contact.content}
                onChange={(e) => setContent({
                  ...content,
                  contact: { ...content.contact, content: e.target.value },
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                rows={5}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

