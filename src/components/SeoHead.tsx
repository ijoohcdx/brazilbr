import React, { useEffect } from 'react';
import { getSeoConfig, type PublicSeoConfig } from '../seo';

const SITE_URL = 'https://brazilbr-zeta.vercel.app';

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function upsertStructuredData(data: Record<string, unknown>) {
  const id = 'brazilbr-structured-data';
  let element = document.getElementById(id) as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

function buildStructuredData(config: PublicSeoConfig, canonicalUrl: string) {
  const organization = {
    '@type': 'Organization',
    name: 'BrazilBR',
    url: SITE_URL,
    description: 'Practical local context for people making a life in Brazil.',
  };

  const website = {
    '@type': 'WebSite',
    name: 'BrazilBR',
    url: SITE_URL,
    description: config.description,
    publisher: { '@type': 'Organization', name: 'BrazilBR', url: SITE_URL },
  };

  const page = {
    '@type': 'WebPage',
    name: config.title,
    description: config.description,
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: 'BrazilBR', url: SITE_URL },
  };

  const faq = config.faq.length > 0
    ? {
      '@type': 'FAQPage',
      mainEntity: config.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    }
    : null;

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website, page, ...(faq ? [faq] : [])],
  };
}

export const SeoHead: React.FC<{ path: string; noindex?: boolean }> = ({ path, noindex = false }) => {
  const config = getSeoConfig(path);
  const canonicalUrl = `${SITE_URL}${config.path === '/' ? '/' : config.path}`;

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = config.title;
    upsertMeta('name', 'description', config.description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'BrazilBR');
    upsertMeta('property', 'og:title', config.title);
    upsertMeta('property', 'og:description', config.description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:locale', 'en_US');
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', config.title);
    upsertMeta('name', 'twitter:description', config.description);
    upsertLink('canonical', canonicalUrl);

    if (noindex) {
      document.getElementById('brazilbr-structured-data')?.remove();
    } else {
      upsertStructuredData(buildStructuredData(config, canonicalUrl));
    }
  }, [canonicalUrl, config, noindex]);

  return null;
};
