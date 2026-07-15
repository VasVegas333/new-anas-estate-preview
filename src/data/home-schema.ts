import { getImage } from 'astro:assets';
import { images } from '../assets/images';
import { SITE } from '../config/site';

export async function getHomeJsonLd() {
  const logo = await getImage({ src: images.logo, format: 'png' });
  const heroBottle = await getImage({ src: images.heroBottle, format: 'png' });
  const caseOf12 = await getImage({ src: images.caseOf12, format: 'png' });
  const socialPreviewUrl = `${SITE.url}/images/social-preview.jpg`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OnlineStore',
        '@id': `${SITE.url}/#organization`,
        name: SITE.name,
        alternateName: "Ana's Estate",
        url: `${SITE.url}/`,
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE.url}/#logo`,
          url: new URL(logo.src, SITE.url).href,
          contentUrl: new URL(logo.src, SITE.url).href,
          caption: SITE.name,
        },
        image: {
          '@type': 'ImageObject',
          url: socialPreviewUrl,
          width: 1200,
          height: 630,
        },
        description:
          "Ana’s Estate produces premium Kalamata PDO Extra Virgin Olive Oil from early-harvest Koroneiki olives grown in family groves in Kalamata, Greece.",
        email: SITE.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Brampton',
          addressRegion: 'Ontario',
          addressCountry: 'CA',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: `${SITE.url}/`,
        name: SITE.name,
        alternateName: "Ana's Estate Olive Oil",
        description: 'Premium Kalamata PDO Extra Virgin Olive Oil from Greece.',
        publisher: { '@id': `${SITE.url}/#organization` },
        inLanguage: 'en-CA',
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE.url}/#webpage`,
        url: `${SITE.url}/`,
        name: 'Premium Kalamata PDO Extra Virgin Olive Oil | Ana’s Estate',
        description:
          'Shop Ana’s Estate premium Kalamata PDO Extra Virgin Olive Oil, produced in Greece from early-harvest Koroneiki olives.',
        isPartOf: { '@id': `${SITE.url}/#website` },
        about: { '@id': `${SITE.url}/#organization` },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: socialPreviewUrl,
          width: 1200,
          height: 630,
        },
        inLanguage: 'en-CA',
      },
      {
        '@type': 'Product',
        '@id': `${SITE.url}/#750ml-bottle`,
        name: 'Ana’s Estate Kalamata PDO Extra Virgin Olive Oil — 750 ml',
        description:
          'Premium single-estate Kalamata PDO Extra Virgin Olive Oil, cold extracted from early-harvest Koroneiki olives grown in Kalamata, Greece.',
        image: [new URL(heroBottle.src, SITE.url).href],
        brand: { '@type': 'Brand', name: SITE.name },
        manufacturer: { '@id': `${SITE.url}/#organization` },
        category: 'Extra Virgin Olive Oil',
        countryOfOrigin: { '@type': 'Country', name: 'Greece' },
        size: '750 ml',
        itemCondition: 'https://schema.org/NewCondition',
        offers: {
          '@type': 'Offer',
          url: `${SITE.url}/#products`,
          price: '65.00',
          priceCurrency: 'CAD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${SITE.url}/#organization` },
        },
      },
      {
        '@type': 'Product',
        '@id': `${SITE.url}/#case-of-12`,
        name: 'Ana’s Estate Kalamata PDO Extra Virgin Olive Oil — Case of 12',
        description:
          'A family estate case containing twelve 750 ml bottles of Ana’s Estate Kalamata PDO Extra Virgin Olive Oil.',
        image: [new URL(caseOf12.src, SITE.url).href],
        brand: { '@type': 'Brand', name: SITE.name },
        manufacturer: { '@id': `${SITE.url}/#organization` },
        category: 'Extra Virgin Olive Oil',
        countryOfOrigin: { '@type': 'Country', name: 'Greece' },
        size: '12 × 750 ml',
        itemCondition: 'https://schema.org/NewCondition',
        offers: {
          '@type': 'Offer',
          url: `${SITE.url}/#products`,
          price: '720.00',
          priceCurrency: 'CAD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${SITE.url}/#organization` },
        },
      },
    ],
  };
}
