import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SeoLandingPage } from '../src/components/SeoLandingPage';
import { HOME_SEO, SEO_PAGES, type PublicSeoConfig } from '../src/seo';

const distDir = path.resolve(process.cwd(), 'dist');
const siteUrl = 'https://brazilbr-zeta.vercel.app';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildStructuredData(config: PublicSeoConfig, canonicalUrl: string) {
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
    '@graph': [
      {
        '@type': 'Organization',
        name: 'BrazilBR',
        url: siteUrl,
        description: 'Practical local context for people making a life in Brazil.',
      },
      {
        '@type': 'WebSite',
        name: 'BrazilBR',
        url: siteUrl,
        description: config.description,
        publisher: { '@type': 'Organization', name: 'BrazilBR', url: siteUrl },
      },
      {
        '@type': 'WebPage',
        name: config.title,
        description: config.description,
        url: canonicalUrl,
        isPartOf: { '@type': 'WebSite', name: 'BrazilBR', url: siteUrl },
      },
      ...(faq ? [faq] : []),
    ],
  };
}

function stripTemplateSeo(html: string) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/<meta name="description"[^>]*>\s*/g, '')
    .replace(/<meta name="robots"[^>]*>\s*/g, '')
    .replace(/<meta property="og:[^"]+"[^>]*>\s*/g, '')
    .replace(/<meta name="twitter:[^"]+"[^>]*>\s*/g, '')
    .replace(/<link rel="canonical"[^>]*>\s*/g, '');
}

function buildHead(config: PublicSeoConfig, canonicalUrl: string) {
  const structuredData = JSON.stringify(buildStructuredData(config, canonicalUrl)).replaceAll('<', '\\u003c');
  return [
    `<title>${escapeHtml(config.title)}</title>`,
    `<meta name="description" content="${escapeHtml(config.description)}" />`,
    '<meta name="robots" content="index, follow" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="BrazilBR" />',
    `<meta property="og:title" content="${escapeHtml(config.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(config.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    '<meta property="og:locale" content="en_US" />',
    '<meta name="twitter:card" content="summary" />',
    `<meta name="twitter:title" content="${escapeHtml(config.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(config.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<script id="brazilbr-structured-data" type="application/ld+json">${structuredData}</script>`,
  ].join('\n    ');
}

async function main() {
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8');

  for (const config of [HOME_SEO, ...Object.values(SEO_PAGES)]) {
    const canonicalUrl = `${siteUrl}${config.path}`;
    const body = renderToStaticMarkup(<SeoLandingPage config={config} />);
    const html = stripTemplateSeo(template)
      .replace(/<html lang="[^"]*">/, '<html lang="en">')
      .replace('</head>', `    ${buildHead(config, canonicalUrl)}\\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    const outputDir = config.path === '/' ? distDir : path.join(distDir, config.path.slice(1));
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, 'index.html'), html);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
