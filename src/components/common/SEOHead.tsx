import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  schema?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  schema,
}) => {
  useEffect(() => {
    // Update Title
    const brandName = 'Real Estate In Bahria Town / Orchard Lahore';
    const fullTitle = title.includes('Bahria Town') || title.includes('Bahria Orchard') || title.includes(brandName)
      ? title
      : `${title} | ${brandName}`;
    document.title = fullTitle;

    // Update Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      // Open Graph
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
    }

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    if (image) {
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (!ogImg) {
        ogImg = document.createElement('meta');
        ogImg.setAttribute('property', 'og:image');
        document.head.appendChild(ogImg);
      }
      ogImg.setAttribute('content', image);
    }

    // JSON-LD structured data
    if (schema) {
      let script = document.getElementById('json-ld-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-schema';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }
  }, [title, description, image, url, schema]);

  return null;
};
