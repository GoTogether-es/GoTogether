'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            className="rounded-2xl border border-gray-100 bg-white overflow-hidden transition-shadow hover:shadow-md"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
            >
              <span className="text-lg font-semibold text-blue-600 pr-4">{item.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
