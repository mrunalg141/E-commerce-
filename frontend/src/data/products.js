export const categories = [
  { name: 'All pieces', tone: 'all', count: '24 pieces' },
  { name: 'Objects', tone: 'objects', count: '08 pieces' },
  { name: 'Textiles', tone: 'textiles', count: '06 pieces' },
  { name: 'Lighting', tone: 'lighting', count: '05 pieces' },
  { name: 'Tabletop', tone: 'tabletop', count: '05 pieces' },
]

export const products = [
  { id: 'linen-form', name: 'Linen Form Chair', category: 'Objects', price: 680, stock: 6, description: 'A sculptural oak frame softened with washed linen. Made for slow mornings and long conversations.', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=900&q=85' },
  { id: 'amber-glow', name: 'Amber Glow Lamp', category: 'Lighting', price: 245, stock: 12, description: 'Hand-blown glass with a warm, generous light that turns any corner into a place to linger.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85' },
  { id: 'stone-vessel', name: 'Stone Study Vessel', category: 'Tabletop', price: 92, stock: 18, description: 'A weighty limestone vessel, shaped by hand and finished with a barely-there matte glaze.', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85' },
  { id: 'quiet-weave', name: 'Quiet Weave Throw', category: 'Textiles', price: 155, stock: 8, description: 'A generous wool and cotton throw with a quiet rhythm of oat, charcoal, and natural fringe.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85' },
  { id: 'arc-mirror', name: 'Arc Wall Mirror', category: 'Objects', price: 410, stock: 4, description: 'Soft geometry for an entryway, bedroom, or anywhere that could use a little more light.', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85' },
  { id: 'daily-cup', name: 'Daily Ritual Cup', category: 'Tabletop', price: 28, stock: 30, description: 'A small stoneware cup with a generous handle and a glaze that gets better with use.', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85' },
]

export const findProduct = (id) => products.find((product) => product.id === id)
