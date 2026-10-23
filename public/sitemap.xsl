<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>Style Corner | XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #0c0e14;
            color: #e2e8f0;
            margin: 0;
            padding: 2rem 1rem;
            line-height: 1.6;
          }
          .container {
            max-width: 960px;
            margin: 0 auto;
            background: #151822;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 1.25rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
          }
          h1 {
            color: #F5B942;
            font-size: 1.5rem;
            margin: 0;
            font-weight: 800;
            letter-spacing: -0.02em;
          }
          p.desc {
            color: #94a3b8;
            font-size: 0.88rem;
            margin: 0.5rem 0 0;
          }
          .badge {
            background: rgba(245, 185, 66, 0.12);
            color: #F5B942;
            border: 1px solid rgba(245, 185, 66, 0.35);
            padding: 0.35rem 0.85rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.88rem;
            margin-top: 1rem;
          }
          th {
            background: rgba(255, 255, 255, 0.04);
            color: #cbd5e1;
            text-align: left;
            padding: 0.85rem 1rem;
            font-weight: 700;
            border-bottom: 2px solid rgba(255, 255, 255, 0.08);
          }
          td {
            padding: 0.85rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          tr:hover td {
            background: rgba(245, 185, 66, 0.04);
          }
          a {
            color: #60a5fa;
            text-decoration: none;
            word-break: break-all;
            transition: color 0.15s;
          }
          a:hover {
            color: #93c5fd;
            text-decoration: underline;
          }
          .priority {
            font-weight: 700;
            color: #F5B942;
          }
          .footer {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            color: #64748b;
            font-size: 0.78rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>Style Corner · XML Sitemap</h1>
              <p class="desc">Standard XML protocol sitemap for search engines (Google, Bing). Formatted for human readability.</p>
            </div>
            <div class="badge">
              <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> Canonical URLs
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 55%;">URL</th>
                <th style="width: 15%;">Change Freq</th>
                <th style="width: 15%;">Priority</th>
                <th style="width: 15%;">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <xsl:variable name="itemURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <a href="{$itemURL}" target="_blank">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td class="priority">
                    <xsl:value-of select="sitemap:priority"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="footer">
            <span>Style Corner Atelier &amp; Grooming Platform</span>
            <span>https://stylecorner.world</span>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
