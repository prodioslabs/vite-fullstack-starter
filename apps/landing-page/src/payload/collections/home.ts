import { CollectionConfig } from 'payload/types'
import { anyone } from '../access/anyone'

export const Home = {
  slug: 'home',
  access: {
    read: anyone,
  },
  fields: [
    {
      type: 'text',
      name: 'title',
      label: 'Title',
      required: false,
    },
    {
      type: 'upload',
      relationTo: 'media',
      required: true,
      name: 'heroImage',
      label: 'Hero Image',
    },
  ],
} satisfies CollectionConfig
